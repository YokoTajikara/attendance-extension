# 勤怠管理 Chrome拡張機能

勤怠時間を簡単に記録・管理できるChrome拡張機能です。

## 機能

- ✅ プロジェクト別の勤怠時間記録
- ✅ 月別の勤怠統計表示
- ✅ Google認証によるログイン
- ✅ Supabaseによる勤怠データ管理
- ✅ 在宅・出社・外出の勤務形態記録

## 技術スタック

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Google OAuth2
- **Build Tool**: Vite

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、Supabaseの設定を追加してください：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## ビルドとデプロイ

### 1. プロダクションビルド

```bash
npm run build
```

### 2. Chrome拡張機能のインストール

1. Chromeで `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `dist` フォルダを選択

## 開発ワークフロー

### 日常的な作業

```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev

# コードの品質チェック
npm run lint

# プロダクションビルド
npm run build
```

### 拡張機能の更新

1. コードを修正
2. `npm run build` でビルド
3. Chrome拡張機能の管理画面で「更新」ボタンをクリック

## プロジェクト構造

```
src/
├── lib/
│   ├── components/          # UIコンポーネント
│   │   ├── AttendanceManager.tsx
│   │   ├── Auth.tsx
│   │   ├── MonthlyTimeStats.tsx
│   │   └── TimeEntryForm.tsx
│   ├── supabase.ts         # Supabase設定
│   ├── types.ts            # TypeScript型定義
│   └── utils.ts            # ユーティリティ関数
├── App.tsx                 # メインアプリ
├── login.tsx              # ログインページ
└── main.tsx               # エントリーポイント
```

## デバッグ

### Chrome DevToolsでのデバッグ

1. 拡張機能のポップアップを右クリック
2. 「検証」を選択
3. DevToolsでコンソールやネットワークを確認

### 主要なログ確認ポイント

- Supabase接続エラー
- 認証関連のエラー
- API通信のエラー

## 注意事項

- `manifest.json`を変更した場合は拡張機能の再読み込みが必要
- 本番環境では適切なOAuth2設定とSupabase設定を使用してください
- アイコンファイルは `public/icons/` に配置されています

## トラブルシューティング

### よくある問題

1. **拡張機能が読み込まれない**
   - `manifest.json`の構文エラーを確認
   - 必要な権限が設定されているか確認

2. **認証が失敗する**
   - Google OAuth2の設定を確認
   - Supabaseの認証設定を確認

3. **ビルドエラー**
   - `npm run lint`でESLintエラーを確認
   - TypeScriptエラーを修正
