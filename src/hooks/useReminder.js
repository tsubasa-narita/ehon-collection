import { useState, useEffect, useCallback } from 'react';
import { useBookDB } from './useBookDB';

const REMINDER_MESSAGES = [
  'きょうもえほんをよもう！🚂',
  'でんしゃがまってるよ！📚',
  'えほんのじかんだよ！🌟',
  'あたらしいでんしゃにあえるかな？🚅',
  'おやすみまえにえほんをよもう！🌙',
];

/**
 * 読書リマインダー通知フック
 *
 * 制限事項:
 * - アプリ（ブラウザタブ/PWA）が開いている時のみ通知可能
 * - バックグラウンドプッシュ通知にはFirebase Cloud Messagingなどが必要（Phase 3候補）
 * - モバイルではService Worker経由のshowNotification()を使用
 */
export function useReminder() {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTimeState] = useState('19:00');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const { getSetting, setSetting } = useBookDB();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    getSetting('reminderEnabled').then((val) => {
      if (val !== undefined) setReminderEnabled(val);
    });
    getSetting('reminderTime').then((val) => {
      if (val) setReminderTimeState(val);
    });
  }, []);

  const showNotification = useCallback(async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
    const options = {
      body: msg,
      icon: '/ehon-collection/icon-192.png',
      badge: '/ehon-collection/icon-192.png',
    };

    // Service Worker経由の通知を優先（モバイル対応）
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification('えほんコレクション', options);
        return;
      } catch {
        // fallback to direct Notification
      }
    }

    // デスクトップフォールバック
    try {
      new Notification('えほんコレクション', options);
    } catch {
      // Notification not supported
    }
  }, []);

  // リマインダースケジュール（アプリが開いている時のみ動作）
  useEffect(() => {
    if (!reminderEnabled || notificationPermission !== 'granted') return;

    const checkReminder = async () => {
      const now = new Date();
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const targetMinutes = hours * 60 + minutes;

      if (Math.abs(currentMinutes - targetMinutes) <= 1) {
        const lastDate = await getSetting('lastNotificationDate');
        const today = now.toISOString().slice(0, 10);
        if (lastDate !== today) {
          showNotification();
          await setSetting('lastNotificationDate', today);
        }
      }
    };

    const interval = setInterval(checkReminder, 30000);
    checkReminder();

    return () => clearInterval(interval);
  }, [reminderEnabled, reminderTime, notificationPermission, showNotification]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  const setReminderTime = useCallback(async (time) => {
    setReminderTimeState(time);
    await setSetting('reminderTime', time);
  }, [setSetting]);

  const toggleReminder = useCallback(async (enabled) => {
    setReminderEnabled(enabled);
    await setSetting('reminderEnabled', enabled);
    if (enabled && notificationPermission === 'default') {
      await requestPermission();
    }
  }, [setSetting, notificationPermission, requestPermission]);

  return {
    reminderEnabled,
    reminderTime,
    notificationPermission,
    requestPermission,
    setReminderTime,
    toggleReminder,
  };
}
