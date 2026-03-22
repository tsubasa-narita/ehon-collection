---
description: えほんコレクションアプリの開発・運用ガイド
---

# えほんコレクション 🚂

3歳の電車好きな男の子向け、**読書 × 鉄道ゲーミフィケーション** 絵本管理PWAアプリ。

- **公開URL**: https://tsubasa-narita.github.io/ehon-collection/
- **リポジトリ**: https://github.com/tsubasa-narita/ehon-collection

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フレームワーク | Vite + React |
| PWA | vite-plugin-pwa (Service Worker自動生成) |
| スタイリング | Vanilla CSS (CSS変数によるデザインシステム) |
| バーコード読取 | html5-qrcode |
| 書籍API | openBD API → Google Books API (フォールバック) |
| データ保存 | IndexedDB (idb ライブラリ) |
| 音声ガイド | Web Speech API (SpeechSynthesis) |
| フォント | Zen Maru Gothic (Google Fonts) |
| デプロイ | GitHub Actions → GitHub Pages |

---

## ディレクトリ構成

```
src/
├── main.jsx                   # エントリポイント
├── App.jsx                    # ルーティング (タブ切替・画面遷移)
├── App.css
├── index.css                  # デザインシステム (CSS変数・共通スタイル・アニメーション)
├── components/
│   ├── BarcodeScanner.jsx     # バーコードスキャン / 手動ISBN入力
│   ├── BookCard.jsx           # 絵本カード (グリッド用)
│   ├── BookDetail.jsx         # 絵本詳細 + 「よんだ！」ボタン + お祝い演出
│   ├── BookList.jsx           # 絵本リスト (フィルタ付きグリッド)
│   ├── TabBar.jsx             # ボトムナビゲーション
│   ├── TrainMap.jsx           # でんしゃマップ + コレクション表示
│   ├── VoiceButton.jsx        # 音声読み上げ付きボタン (共通)
│   └── *.css                  # 各コンポーネントのスタイル
├── hooks/
│   ├── useBookDB.js           # IndexedDB CRUD (books / settings ストア)
│   └── useVoice.js            # Web Speech API ラッパー
├── utils/
│   ├── bookApi.js             # openBD / Google Books API 呼び出し
│   └── trainData.js           # 電車コレクション・駅・レアリティ定義
public/
├── trains/                    # 電車画像 (水彩画風の生成画像)
│   ├── yamanote.webp
│   ├── hayabusa.webp
│   ├── komachi.webp
│   ├── kagayaki.webp
│   └── doctor_yellow.webp
.github/
└── workflows/
    └── deploy.yml             # GitHub Pages 自動デプロイ
```

---

## ローカル開発

```bash
# 依存インストール
npm install --legacy-peer-deps

# 開発サーバー起動
npm run dev

# LAN内のスマホからもアクセスする場合
npm run dev -- --host

# プロダクションビルド
npm run build

# ビルド結果プレビュー
npm run preview
```

---

## デプロイ

mainブランチにpushすると **GitHub Actions が自動でビルド → GitHub Pages にデプロイ** する。

```bash
git add -A
git commit -m "feat: 機能追加の説明"
git push origin main
# → 自動で https://tsubasa-narita.github.io/ehon-collection/ に反映
```

**注意**: `vite.config.js` の `base: '/ehon-collection/'` はGitHub Pages用。
ローカル開発時はViteが自動でハンドルするので変更不要。

---

## 主要機能と設計

### バーコードスキャン → 絵本登録

1. `BarcodeScanner.jsx` がカメラ起動 (`html5-qrcode`)
2. ISBN (EAN-13) を検出 → `bookApi.js` が openBD API で書籍情報取得
3. openBD になければ Google Books API にフォールバック
4. `useBookDB.js` の `addBook()` で IndexedDB に保存
5. カメラ非対応時は手動ISBN入力にフォールバック

### でんしゃマップ

- `TrainMap.jsx` が SVG で線路・駅を描画
- 駅データは `trainData.js` の `STATIONS` 配列で定義
- 累計読了数 (`getTotalReadCount()`) に応じて到達駅が変化

### でんしゃコレクション

- `trainData.js` の `TRAINS` 配列で電車データを定義
- `unlockAt` で何冊読んだら解放されるかを設定
- レアリティ: `normal` → `rare` → `super_rare` → `legendary`

### 読了記録

- `BookDetail.jsx` の「よんだ！」ボタンが `useBookDB.js` の `markAsRead()` を呼ぶ
- `readCount++`、`readDates[]` に日時追加
- お祝い演出: 紙吹雪アニメーション + 音声「すごい！えほんをよめたね！」

### 音声ガイド

- `useVoice.js` が `window.speechSynthesis` をラップ
- `VoiceButton.jsx` 経由で子ども向け画面のボタンに音声を付与
- 日本語 (`ja-JP`)、速度 0.9 (ゆっくりめ)

---

## 電車画像の追加方法

新しい電車を追加するには:

1. 画像生成ツールで以下のテンプレートを使用:

```
水彩画風の＜電車名＞の画像を作成して。
・電車の窓からはかわいい動物が手を振っています。
・電車自体のデザインは本物に似せてください。
・背景はこの電車が走っているエリアと合うようにして。そのエリア独自の食べ物やキャラクターや場所などがあれば登場させて
・画像の縦横比は１対１
```

2. 生成画像を `public/trains/<id>.webp` に配置

3. `src/utils/trainData.js` の `TRAINS` 配列にエントリ追加:

```js
{
  id: 'shinkansen_name',
  name: '表示名',
  nameKana: 'ひらがな',
  series: '形式',
  image: '/trains/shinkansen_name.webp',
  unlockAt: 12,           // 何冊読んだら解放
  rarity: 'rare',         // normal | rare | super_rare | legendary
  color: '#hexcolor',
  description: 'ひらがなの説明文',
}
```

4. 必要に応じて `STATIONS` 配列にも新しい駅を追加

---

## データモデル (IndexedDB)

### books ストア

```js
{
  id: number,              // 自動採番
  isbn: string,
  title: string,
  author: string,
  publisher: string,
  coverUrl: string,
  status: 'unread' | 'read',
  readCount: number,
  readDates: string[],     // ISO 8601 日時の配列
  favorite: boolean,
  createdAt: string,       // ISO 8601
}
```

### settings ストア

```js
{ key: string, value: any }
```

---

## 今後の拡張予定 (Phase 2+)

- ガチャ演出 (電車アンロック時のアニメーション)
- 駅到着時のサウンドエフェクト (発車メロディ・汽笛)
- 読書カレンダー (スタンプ機能)
- 読書レポート (月間/週間グラフ)
- データ同期 (Firebase等で家族間共有)
- 通知リマインダー
