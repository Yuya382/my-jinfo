# jinfo コーディングルール

このドキュメントは、jinfoプロジェクトをClaude Codeで再実装する際に従うべきコーディングルールとアーキテクチャガイドラインです。

## 🏗️ プロジェクト構造

### ディレクトリ構成
```
jinfo/
├── package.json              # プロジェクト設定（ESMモジュール必須）
├── tsconfig.json             # TypeScript設定
├── vite.config.ts            # Vite/Vitestテスト設定
├── .gitignore               # Git除外設定
├── bin/
│   └── jinfo.js             # 実行可能ファイル（#!/usr/bin/env node）
├── src/
│   ├── index.ts             # メインエントリーポイント
│   ├── commands/            # コマンド実装
│   │   ├── add.ts           # メモ追加（デフォルトアクション）
│   │   ├── list.ts          # 一覧表示
│   │   ├── search.ts        # 検索機能
│   │   └── project.ts       # プロジェクト管理
│   ├── config/
│   │   ├── manager.ts       # ConfigManagerクラス
│   │   └── types.ts         # 設定関連の型定義
│   ├── storage/
│   │   ├── writer.ts        # MemoWriterクラス
│   │   └── reader.ts        # MemoReaderクラス
│   └── utils/
│       ├── logger.ts        # ログ出力（chalk使用）
│       └── formatter.ts     # フォーマット処理
├── tests/
│   ├── utils/               # ユーティリティテスト
│   ├── config/              # 設定管理テスト
│   ├── storage/             # ストレージテスト
│   └── integration/         # 統合テスト
└── docs/                    # ドキュメント
```

## 📦 必須依存関係

### 本体依存関係
```json
{
  "dependencies": {
    "commander": "^14.0.0",        // CLIフレームワーク
    "chalk": "^5.4.1",             // カラー出力（ESM版）
    "@inquirer/prompts": "^7.5.3", // インタラクティブプロンプト
    "dayjs": "^1.11.13",           // 日付処理
    "fs-extra": "^11.3.0"          // ファイル操作
  }
}
```

### 開発依存関係
```json
{
  "devDependencies": {
    "typescript": "^5.8.3",
    "@types/node": "^24.0.7",
    "@types/fs-extra": "^11.0.4",
    "vite": "^7.0.0",
    "vitest": "^3.2.4",
    "jsdom": "^26.1.0",
    "tsx": "^4.20.3",
    "prettier": "^3.6.2",
    "eslint": "^9.30.0"
  }
}
```

### package.json必須設定
```json
{
  "name": "jinfo",
  "type": "module",              // ESMモジュール必須
  "bin": {
    "jinfo": "./bin/jinfo.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 🎯 TypeScript設定

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🏛️ アーキテクチャパターン

### 1. 設定管理（ConfigManager）
```typescript
// src/config/manager.ts
export class ConfigManager {
  private config: Config | null = null;
  
  async loadConfig(): Promise<Config>
  async saveConfig(config: Config): Promise<void>
  async createDefaultConfig(): Promise<void>
  async addProject(name: string, path: string, description?: string): Promise<void>
  async setDefaultProject(name: string): Promise<void>
  async getProject(name?: string): Promise<ProjectConfig>
  async listProjects(): Promise<Record<string, ProjectConfig>>
}
```

### 2. ストレージ層
```typescript
// src/storage/writer.ts
export class MemoWriter {
  constructor(private basePath: string)
  async addMemo(content: string, date?: string): Promise<void>
}

// src/storage/reader.ts
export class MemoReader {
  constructor(private basePath: string)
  async readMemos(date?: string): Promise<MemoEntry[]>
  async readRecentMemos(days: number = 7): Promise<MemoEntry[]>
  async searchMemos(query: string, options?: SearchOptions): Promise<MemoEntry[]>
}
```

### 3. ユーティリティ
```typescript
// src/utils/logger.ts
export const logger = {
  success: (message: string) => console.log(chalk.green('✓ ' + message)),
  error: (message: string) => console.log(chalk.red('✗ ' + message)),
  info: (message: string) => console.log(chalk.blue('ℹ ' + message)),
  warning: (message: string) => console.log(chalk.yellow('⚠ ' + message))
};

// src/utils/formatter.ts
export const getTimestamp = (): string
export const extractTags = (content: string): string[]
export const formatMemo = (content: string): string
```

## 🎨 コーディング規約

### 命名規則
```typescript
// 変数・関数: camelCase
const memoContent = 'example';
function formatMemo(content: string): string { }

// クラス: PascalCase
class ConfigManager { }

// 定数: UPPER_SNAKE_CASE
const DEFAULT_CONFIG = { };

// ファイル名: kebab-case
config-manager.ts
memo-writer.ts
```

### インポート順序
```typescript
// 1. Node.js組み込みモジュール
import { readFile } from 'fs/promises';
import { join } from 'path';

// 2. 外部ライブラリ
import chalk from 'chalk';
import { Command } from 'commander';

// 3. 内部モジュール
import { logger } from '../utils/logger.js';
import type { Config } from './types.js';
```

### ESM対応
```typescript
// 必ず.js拡張子を付ける
import { logger } from '../utils/logger.js';
import { ConfigManager } from './config/manager.js';

// Dynamic importも同様
const module = await import('./dynamic-module.js');
```

## 📁 ファイル仕様

### 設定ファイル形式
```typescript
// ~/.jinfo/config.json
interface Config {
  version: string;
  defaultProject: string;
  projects: Record<string, ProjectConfig>;
  preferences: Preferences;
}

interface ProjectConfig {
  path: string;
  description: string;
}
```

### メモファイル形式
```markdown
// YYYY-MM-DD.md
[2024-01-15 14:30:45] メモ内容 #タグ1 #タグ2
[2024-01-15 15:20:10] 別のメモ内容
```

### タグ正規表現
```typescript
const tagRegex = /#[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
```

## 🧪 テスト戦略

### テスト構造
```
tests/
├── utils/
│   ├── formatter.test.ts    // ユーティリティ関数
│   └── logger.test.ts
├── config/
│   └── manager.test.ts      // 設定管理
├── storage/
│   ├── writer.test.ts       // ストレージ層
│   └── reader.test.ts
└── integration/
    └── cli.test.ts          // E2Eテスト
```

### Vitest設定
```typescript
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
```

### モック戦略
```typescript
// ファイルシステムのモック
vi.mock('fs');
vi.mock('fs/promises');

// 日付のモック
vi.spyOn(dayjs.prototype, 'format').mockReturnValue('[2024-01-15 14:30:45]');
```

## 🎛️ CLI設計

### Commander.js構造
```typescript
// src/index.ts
const program = new Command();

// デフォルトアクション（メモ追加）
program
  .argument('[memo]', 'メモ内容')
  .option('-p, --project <name>', 'プロジェクト名を指定')
  .action(async (memo, options) => { });

// サブコマンド
program.command('list').description('メモの一覧表示');
program.command('search <query>').description('メモの検索');
program.command('project').description('プロジェクト管理');
```

### エラーハンドリング
```typescript
try {
  // 処理
} catch (error) {
  logger.error(`エラーが発生しました: ${error}`);
  process.exit(1);
}
```

## 🔒 セキュリティ要件

### パス検証
```typescript
// ディレクトリトラバーサル対策
import { resolve, join } from 'path';

const safePath = resolve(join(basePath, userInput));
if (!safePath.startsWith(resolve(basePath))) {
  throw new Error('Invalid path');
}
```

### 入力サニタイズ
```typescript
// ファイル名に使用できない文字の除去
const sanitized = input.replace(/[<>:"/\\|?*]/g, '');
```

## 🚀 パフォーマンス要件

### ファイル操作
```typescript
// 必要な分のみ読み込み
const files = await readdir(basePath);
const memoFiles = files.filter(file => file.endsWith('.md'));

// 並列処理
const promises = memoFiles.map(file => readMemos(file));
const results = await Promise.all(promises);
```

### メモリ効率
```typescript
// ストリーミング処理（大きなファイル対応）
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const fileStream = createReadStream(filepath);
const rl = createInterface({ input: fileStream });
```

## 🌍 国際化対応

### 日本語サポート
```typescript
// 日本語タグの正規表現
const japaneseTagRegex = /#[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;

// UTF-8エンコーディング必須
await writeFile(filepath, content, 'utf-8');
```

### 文字列処理
```typescript
// 大文字小文字を区別しない検索（日本語対応）
const match = content.toLowerCase().includes(query.toLowerCase());
```

## ⚙️ 開発ツール設定

### スクリプト設定
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "prepare": "npm run build"
  }
}
```

### Git設定
```gitignore
node_modules/
dist/
*.log
.DS_Store
.vscode/
.idea/
*.tmp
*.temp
```

## 🎭 実装優先順位

### Phase 1: 基盤実装
1. プロジェクト初期化とTypeScript設定
2. 基本ディレクトリ構造作成
3. 必要ライブラリのインストール
4. ユーティリティ関数実装（logger, formatter）

### Phase 2: コア機能
1. 設定管理機能（ConfigManager）
2. ストレージ機能（Writer, Reader）
3. メインエントリーポイント
4. 基本CLIコマンド

### Phase 3: 高度な機能
1. 検索機能の実装
2. プロジェクト管理機能
3. エラーハンドリングの強化
4. パフォーマンス最適化

### Phase 4: 品質保証
1. 包括的なテスト作成
2. ドキュメント作成
3. ビルドとパッケージ設定
4. 公開準備

## 🔍 重要な実装ポイント

### 1. ESMモジュール対応
- `"type": "module"`の設定必須
- すべてのimportで`.js`拡張子必須
- `__dirname`の代替実装が必要

### 2. クロスプラットフォーム対応
- パス操作は`path`モジュール使用
- ファイル権限の適切な処理
- 改行コードの統一

### 3. エラー回復力
- 設定ファイル自動作成
- ディレクトリ自動作成
- 適切なエラーメッセージ

### 4. 日本語完全対応
- UTF-8エンコーディング
- 日本語タグサポート
- 日本語検索対応

このコーディングルールに従って実装することで、高品質で保守性の高いjinfoツールを構築できます。