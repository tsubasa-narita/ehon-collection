import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBookDB } from '../hooks/useBookDB';

const ModeContext = createContext(null);

/**
 * アプリモード管理
 * 'child' = 子どもモード (でんしゃモード 🚂)
 * 'parent' = 親モード (おやモード 🔧)
 */
export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(null); // null = 未選択
  const [loading, setLoading] = useState(true);
  const { getSetting, setSetting } = useBookDB();

  // 初回起動時にモード設定を読み込み
  useEffect(() => {
    (async () => {
      const saved = await getSetting('appMode');
      if (saved) {
        setModeState(saved);
      }
      setLoading(false);
    })();
  }, []);

  const setMode = useCallback(async (newMode) => {
    setModeState(newMode);
    await setSetting('appMode', newMode);
  }, [setSetting]);

  const value = {
    mode,
    setMode,
    isChild: mode === 'child',
    isParent: mode === 'parent',
    loading,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return ctx;
}
