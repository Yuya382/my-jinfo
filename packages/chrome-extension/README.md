# jinfo Chrome Extension

jinfo Chrome拡張機能は、ブラウザ上でメモを管理できるシンプルなツールです。

## 特徴

- ✨ **簡単操作**: ワンクリックでメモを追加・編集・削除
- 📁 **ローカル保存**: ブラウザのローカルストレージに安全に保存
- 🏷️ **タグ機能**: `#tag` 形式でメモを分類
- 🔍 **高速検索**: キーワードやタグで瞬時に検索
- 📊 **統計情報**: メモ数やタグ使用状況を確認
- 💾 **データ管理**: エクスポート・インポート機能

## 技術スタック

- **Frontend**: React + TypeScript
- **Styling**: TailwindCSS
- **Build**: Vite
- **Testing**: Vitest + Playwright
- **Development**: TDD (Test-Driven Development)

## セットアップ

### 開発環境

```bash
# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev

# ビルド
pnpm build
```

### Chrome拡張機能として読み込み

1. `pnpm build` でビルド
2. Chromeで `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `dist` フォルダを選択

## 使用方法

### 基本的な使い方

1. **メモの追加**
   - ツールバーの jinfo アイコンをクリック
   - 「追加」タブでメモを入力
   - `#タグ名` でタグを追加

2. **メモの検索**
   - 「一覧」タブで検索バーを使用
   - キーワードまたはタグで検索

3. **メモの編集・削除**
   - 各メモの編集・削除ボタンをクリック

### 高度な機能

- **統計情報**: 右クリックメニューから「オプション」を選択
- **データのエクスポート**: オプションページでJSONファイルとして保存
- **データのインポート**: JSONファイルからメモを読み込み

## 開発

### テスト

```bash
# ユニットテスト
pnpm test

# E2Eテスト
pnpm test:e2e

# テストカバレッジ
pnpm test:coverage
```

### コードフォーマット

```bash
# Lintチェック
pnpm lint

# 自動修正
pnpm lint:fix
```

## プロジェクト構造

```
packages/chrome-extension/
├── src/
│   ├── components/          # Reactコンポーネント
│   ├── services/           # ビジネスロジック
│   ├── types/              # TypeScript型定義
│   ├── styles/             # スタイル
│   ├── popup/              # ポップアップ画面
│   ├── options/            # オプション画面
│   └── background/         # バックグラウンドスクリプト
├── tests/
│   ├── e2e/                # E2Eテスト
│   └── setup.ts            # テストセットアップ
├── manifest.json           # Chrome拡張機能マニフェスト
└── vite.config.ts          # Vite設定
```

## 貢献

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

ISC License

## 関連リンク

- [CLI版 jinfo](../cli/README.md)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)