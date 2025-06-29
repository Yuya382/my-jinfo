# jinfo への貢献ガイド

jinfoプロジェクトへの貢献を検討していただき、ありがとうございます！このガイドでは、効果的な貢献方法について説明します。

## 目次
1. [貢献の種類](#貢献の種類)
2. [開発環境のセットアップ](#開発環境のセットアップ)
3. [開発ワークフロー](#開発ワークフロー)
4. [コーディング規約](#コーディング規約)
5. [テスト](#テスト)
6. [プルリクエストガイドライン](#プルリクエストガイドライン)
7. [Issue報告](#issue報告)

## 貢献の種類

### 歓迎する貢献
- **バグ修正**: 動作しない機能の修正
- **新機能**: 新しい機能の実装
- **パフォーマンス改善**: 処理速度やメモリ使用量の最適化
- **ドキュメント改善**: README、API文書、使用例の追加・改善
- **テスト改善**: テストカバレッジの向上、テストケースの追加
- **翻訳**: 英語版ドキュメントの作成
- **リファクタリング**: コードの品質向上

### 検討が必要な変更
以下の変更は事前にIssueでの議論をお願いします：
- **大幅な設計変更**: アーキテクチャの大幅な変更
- **破壊的変更**: 既存のAPIやファイル形式の変更
- **新しい依存関係の追加**: 新しいライブラリの導入

## 開発環境のセットアップ

### 必要な環境
- Node.js 18.0.0以上
- pnpm（推奨）またはnpm
- Git

### セットアップ手順

1. **リポジトリのフォーク**
   ```bash
   # GitHubでリポジトリをフォーク後
   git clone https://github.com/yourusername/jinfo.git
   cd jinfo
   ```

2. **依存関係のインストール**
   ```bash
   pnpm install
   ```

3. **開発用ビルド**
   ```bash
   pnpm build
   ```

4. **テストの実行**
   ```bash
   pnpm test:run
   ```

5. **動作確認**
   ```bash
   pnpm dev "テストメモ"
   ```

### プロジェクト構造
```
jinfo/
├── src/                    # TypeScriptソースコード
│   ├── commands/          # コマンド実装
│   ├── config/            # 設定管理
│   ├── storage/           # ファイル読み書き
│   ├── utils/             # ユーティリティ
│   └── index.ts           # メインエントリーポイント
├── tests/                 # テストファイル
│   ├── unit/              # 単体テスト
│   ├── integration/       # 統合テスト
│   └── fixtures/          # テストデータ
├── docs/                  # ドキュメント
├── bin/                   # 実行ファイル
└── dist/                  # ビルド出力
```

## 開発ワークフロー

### ブランチ戦略

1. **メインブランチ**: `main`
   - 常に安定した状態を維持
   - プロダクション準備完了のコード

2. **機能ブランチ**: `feature/機能名`
   - 新機能開発用
   - 例: `feature/search-optimization`

3. **バグ修正ブランチ**: `fix/バグ名`
   - バグ修正用
   - 例: `fix/config-loading-error`

### 開発フロー

1. **Issueの作成または確認**
   ```bash
   # 新機能の場合は事前にIssueで議論
   ```

2. **ブランチの作成**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/new-feature
   ```

3. **開発とテスト**
   ```bash
   # 開発
   pnpm dev

   # テスト
   pnpm test

   # ビルド確認
   pnpm build
   ```

4. **コミット**
   ```bash
   git add .
   git commit -m "feat: add new search feature"
   ```

5. **プッシュとプルリクエスト**
   ```bash
   git push origin feature/new-feature
   # GitHubでプルリクエストを作成
   ```

## コーディング規約

### TypeScript規約

#### 命名規則
```typescript
// 変数・関数: camelCase
const memoContent = 'example';
function formatMemo(content: string): string { }

// クラス: PascalCase
class ConfigManager { }

// 定数: UPPER_SNAKE_CASE
const DEFAULT_CONFIG = { };

// インターフェース: PascalCase
interface MemoEntry { }

// 型エイリアス: PascalCase
type ProjectConfig = { };
```

#### ファイル命名
```
// ファイル名: kebab-case
config-manager.ts
memo-writer.ts
storage-reader.ts

// テストファイル: 対応するファイル名.test.ts
config-manager.test.ts
memo-writer.test.ts
```

### コードスタイル

#### インポート順序
```typescript
// 1. Node.js組み込みモジュール
import { readFile } from 'fs/promises';
import { join } from 'path';

// 2. 外部ライブラリ
import chalk from 'chalk';
import dayjs from 'dayjs';

// 3. 内部モジュール
import { logger } from '../utils/logger.js';
import type { Config } from './types.js';
```

#### 型定義
```typescript
// 明示的な型定義を推奨
function addMemo(content: string, date?: string): Promise<void> {
  // 実装
}

// 戻り値の型を明示
async function loadConfig(): Promise<Config> {
  // 実装
}
```

#### エラーハンドリング
```typescript
// try-catchを適切に使用
try {
  const config = await this.loadConfig();
  // 処理
} catch (error) {
  logger.error(`設定の読み込みに失敗しました: ${error}`);
  throw error;
}
```

### ESLintとPrettier
プロジェクトにはESLintとPrettierが設定されています：

```bash
# Lint実行
pnpm lint

# フォーマット実行
pnpm format
```

## テスト

### テスト戦略

#### 単体テスト
各モジュールの個別機能をテスト：
```typescript
// utils/formatter.test.ts
describe('formatMemo', () => {
  it('should format memo with timestamp', () => {
    const result = formatMemo('test content');
    expect(result).toMatch(/^\[.*\] test content$/);
  });
});
```

#### 統合テスト
複数モジュールの連携をテスト：
```typescript
// integration/cli.test.ts
describe('CLI Integration', () => {
  it('should add and list memos', async () => {
    await runCLI(['Test memo']);
    const result = await runCLI(['list']);
    expect(result.stdout).toContain('Test memo');
  });
});
```

### テスト実行

```bash
# 全テスト実行
pnpm test:run

# ウォッチモード
pnpm test

# カバレッジ付き
pnpm test:coverage

# 特定のテストファイル
pnpm test formatter.test.ts
```

### テスト作成ガイドライン

1. **テスト名は動作を明確に記述**
   ```typescript
   // 良い例
   it('should extract Japanese tags from content', () => {

   // 悪い例
   it('tags test', () => {
   ```

2. **AAA（Arrange-Act-Assert）パターン**
   ```typescript
   it('should format memo with timestamp', () => {
     // Arrange
     const content = 'test memo';
     
     // Act
     const result = formatMemo(content);
     
     // Assert
     expect(result).toContain('test memo');
   });
   ```

3. **モックの適切な使用**
   ```typescript
   beforeEach(() => {
     vi.mocked(readFile).mockResolvedValue('mock data');
   });
   ```

## プルリクエストガイドライン

### プルリクエスト作成前チェックリスト

- [ ] `pnpm test:run` が成功する
- [ ] `pnpm build` が成功する
- [ ] `pnpm lint` が成功する
- [ ] 新機能にはテストが追加されている
- [ ] ドキュメントが更新されている（必要に応じて）
- [ ] 破壊的変更がある場合は明記されている

### プルリクエストタイトル

以下のプレフィックスを使用：
- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメント変更
- `style:` - コードフォーマット変更
- `refactor:` - リファクタリング
- `test:` - テスト追加・修正
- `chore:` - その他の変更

例：
```
feat: add search by date range functionality
fix: resolve config loading error on Windows
docs: update usage examples in README
```

### プルリクエスト説明

```markdown
## 概要
この変更の目的と内容を簡潔に説明

## 変更内容
- 追加された機能や修正されたバグ
- 変更されたファイルの概要

## テスト
- 追加されたテストケース
- 動作確認した内容

## チェックリスト
- [ ] テストが通る
- [ ] ドキュメントが更新されている
- [ ] 破壊的変更がある場合は記載されている

## その他
追加で説明が必要な内容があれば記載
```

### レビュープロセス

1. **自動チェック**: GitHub Actionsでのテスト実行
2. **コードレビュー**: メンテナーによるレビュー
3. **修正対応**: レビューコメントへの対応
4. **マージ**: 承認後にメンテナーがマージ

## Issue報告

### バグ報告

以下の情報を含めてください：

```markdown
## バグの説明
何が起こっているかを明確に説明

## 再現手順
1. コマンド実行: `jinfo "test"`
2. 発生した現象
3. 期待される動作

## 環境情報
- OS: [例: macOS 14.0]
- Node.js: [例: 18.17.0]
- jinfo: [例: 1.0.0]

## エラーログ
```
エラーメッセージをここに貼り付け
```

## 追加情報
その他関連する情報
```

### 機能要望

```markdown
## 機能の説明
どのような機能が欲しいかを説明

## 動機
なぜその機能が必要かを説明

## 提案する解決策
どのように実装するかのアイデア

## 代替案
他に考えられる解決方法
```

## コミュニティガイドライン

### 行動規範
- 建設的で敬意ある議論を心がける
- 多様な意見や経験レベルを尊重する
- 問題は人ではなく技術的な内容に焦点を当てる

### コミュニケーション
- **Issue**: バグ報告、機能要望、質問
- **Discussions**: アイデアの議論、一般的な質問
- **プルリクエスト**: 具体的なコード変更の提案

## 謝辞

jinfoプロジェクトへの貢献者の皆様に感謝いたします。あなたの貢献により、このツールはより良いものになります。

## 質問がある場合

- [Discussions](https://github.com/yourusername/jinfo/discussions)で質問する
- [Issues](https://github.com/yourusername/jinfo/issues)でバグ報告や機能要望をする

貢献をお待ちしています！