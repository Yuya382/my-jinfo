# 開発ガイド

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js 18.0.0以上
- pnpm 10.6.5以上
- Git

### セットアップ手順

```bash
# リポジトリのクローン
git clone https://github.com/your-username/jinfo.git
cd jinfo

# 依存関係のインストール
pnpm install

# Git hookの初期化（自動実行される）
# 手動で実行する場合: npx husky install

# 開発サーバーの起動
pnpm dev
```

## 📝 Conventional Commitsの運用

### 概要
このプロジェクトではConventional Commitsを採用し、一貫性のあるコミットメッセージを維持しています。

### コミット方法

#### 方法1: 対話式コミット（推奨）
```bash
# ステージング
git add .

# 対話式コミット作成
pnpm commit
```

#### 方法2: 手動コミット
```bash
git commit -m "feat(interactive): add semantic memo type selection"
```

### コミットタイプ

| タイプ | 説明 | 例 |
|---|---|---|
| `feat` | 新機能 | `feat(cli): add new search command` |
| `fix` | バグ修正 | `fix(storage): resolve file permission issue` |
| `docs` | ドキュメント | `docs: update installation guide` |
| `style` | コード整形 | `style: fix indentation in utils` |
| `refactor` | リファクタリング | `refactor(config): simplify manager class` |
| `perf` | パフォーマンス改善 | `perf(search): optimize file scanning` |
| `test` | テスト | `test(utils): add formatter unit tests` |
| `chore` | 雑務 | `chore(deps): update dependencies` |
| `ci` | CI/CD | `ci: add automated testing workflow` |

### スコープ（オプション）

| スコープ | 説明 |
|---|---|
| `core` | コア機能 |
| `cli` | CLI関連 |
| `interactive` | 対話式機能 |
| `semantic` | セマンティックメモ |
| `config` | 設定管理 |
| `storage` | ストレージ |
| `utils` | ユーティリティ |
| `project` | プロジェクト管理 |
| `search` | 検索機能 |
| `types` | 型定義 |
| `docs` | ドキュメント |
| `test` | テスト |
| `deps` | 依存関係 |
| `build` | ビルド |
| `ci` | CI/CD |

### 破壊的変更
破壊的変更がある場合は以下のように記述：

```bash
# type!を使用
feat!: change default behavior to interactive mode

# または本文でBREAKING CHANGEを説明
feat(interactive): make interactive mode the default

BREAKING CHANGE: The default behavior of `jinfo` command has changed 
from simple memo input to full interactive mode. Use `--simple` option 
for the previous behavior.
```

## 🔍 品質管理

### 自動チェック

コミット時に以下が自動実行されます：

1. **Pre-commit Hook**
   - テスト実行（`pnpm test:run`）
   - TypeScriptビルド（`pnpm build`）

2. **Commit-msg Hook**
   - コミットメッセージのConventional Commits準拠チェック

### 手動チェック

```bash
# テスト実行
pnpm test

# テストのカバレッジ
pnpm test:coverage

# TypeScriptビルド
pnpm build

# コミットメッセージの検証
echo "feat: add new feature" | npx commitlint
```

## 🧪 テスト

### テスト実行
```bash
# 全テスト実行
pnpm test

# テスト一回実行
pnpm test:run

# カバレッジ付きテスト
pnpm test:coverage
```

### テスト構造
```
tests/
├── utils/               # ユーティリティのテスト
├── config/              # 設定管理のテスト
├── storage/             # ストレージのテスト
└── integration/         # 統合テスト
```

### テストファイル命名規則
- `*.test.ts` - 単体テスト
- `*.integration.test.ts` - 統合テスト

## 📚 コーディング規約

### TypeScript
- strict modeを有効化
- ESModuleを使用（`"type": "module"`）
- 全てのimportで`.js`拡張子を明記

### 命名規則
- **変数・関数**: `camelCase`
- **クラス**: `PascalCase`
- **定数**: `UPPER_SNAKE_CASE`
- **ファイル**: `kebab-case`

### インポート順序
```typescript
// 1. Node.js組み込みモジュール
import { readFile } from 'fs/promises';

// 2. 外部ライブラリ
import chalk from 'chalk';

// 3. 内部モジュール
import { logger } from '../utils/logger.js';
import type { Config } from './types.js';
```

## 🔄 開発ワークフロー

### 1. 機能開発
```bash
# フィーチャーブランチ作成
git checkout -b feat/new-feature

# 開発
# ... コード変更 ...

# ステージング
git add .

# 対話式コミット
pnpm commit

# プッシュ
git push origin feat/new-feature
```

### 2. バグ修正
```bash
# バグ修正ブランチ作成
git checkout -b fix/bug-description

# 修正
# ... コード変更 ...

# テスト
pnpm test

# コミット
pnpm commit

# プッシュ
git push origin fix/bug-description
```

### 3. リリース準備
```bash
# リリースブランチ作成
git checkout -b release/v1.1.0

# バージョン更新
npm version minor

# 最終テスト
pnpm test:run
pnpm build

# コミット
git commit -m "chore(release): bump version to 1.1.0"

# マージ
git checkout main
git merge release/v1.1.0
git tag v1.1.0
```

## 🛠️ トラブルシューティング

### よくある問題

#### Huskyが動作しない
```bash
# Husky再インストール
npx husky install
chmod +x .husky/*
```

#### コミットメッセージエラー
```bash
# commitlintのチェック
echo "your commit message" | npx commitlint

# コミットメッセージテンプレートを確認
cat .gitmessage
```

#### テスト失敗
```bash
# 詳細なテスト出力
pnpm test --reporter=verbose

# 特定のテストファイル実行
pnpm test utils/formatter.test.ts
```

## 📋 チェックリスト

### プルリクエスト前
- [ ] テストが全て通る
- [ ] ビルドが成功する
- [ ] Conventional Commitsに準拠している
- [ ] 関連ドキュメントを更新している
- [ ] 破壊的変更がある場合、適切に記述している

### リリース前
- [ ] 全機能のテストが通る
- [ ] パフォーマンステストを実行
- [ ] ドキュメントが最新状態
- [ ] CHANGELOG.mdを更新
- [ ] バージョン番号を適切に更新

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feat/amazing-feature`)
3. 変更をコミット (`pnpm commit`)
4. ブランチをプッシュ (`git push origin feat/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

質問や問題がある場合：
- [Issues](https://github.com/your-username/jinfo/issues) で報告
- [Discussions](https://github.com/your-username/jinfo/discussions) で議論

---

Happy coding! 🎉