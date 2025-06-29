# jinfo - コマンドラインメモツール実装指示書

## 概要
`jinfo` は、どこからでも素早くメモを記録できるCLIツールです。デイリーログ形式で保存し、プロジェクトごとにメモを管理できます。

## 技術スタック
- TypeScript (最新版)
- pnpm (パッケージマネージャー)
- Node.js (LTS版推奨)

## 必須ライブラリ
```json
{
  "dependencies": {
    "commander": "最新版",      // CLIコマンド解析
    "chalk": "^5.0.0",         // カラフルな出力（ESM版）
    "inquirer": "最新版",      // インタラクティブプロンプト
    "dayjs": "最新版",         // 日付処理
    "fs-extra": "最新版",      // ファイル操作
    "os": "組み込み",          // OS情報取得
    "path": "組み込み"         // パス操作
  },
  "devDependencies": {
    "typescript": "最新版",
    "@types/node": "最新版",
    "@types/fs-extra": "最新版",
    "@types/inquirer": "最新版",
    "tsx": "最新版",           // TypeScript実行
    "prettier": "最新版",
    "eslint": "最新版"
  }
}
```

## ディレクトリ構造
```
jinfo/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── bin/
│   └── jinfo.js          # npx実行用エントリーポイント
├── src/
│   ├── index.ts          # メインエントリー
│   ├── commands/
│   │   ├── add.ts        # メモ追加コマンド
│   │   ├── list.ts       # 一覧表示コマンド
│   │   ├── search.ts     # 検索コマンド
│   │   └── project.ts    # プロジェクト切り替え
│   ├── config/
│   │   ├── manager.ts    # 設定管理
│   │   └── types.ts      # 設定の型定義
│   ├── storage/
│   │   ├── writer.ts     # ファイル書き込み
│   │   └── reader.ts     # ファイル読み込み
│   └── utils/
│       ├── logger.ts     # カラフル出力
│       └── formatter.ts  # フォーマット処理
└── dist/                 # ビルド出力
```

## 機能仕様

### 1. 基本機能

#### メモの追加
```bash
# 通常のメモ追加
npx jinfo "メモ内容"

# タグ付きメモ
npx jinfo "会議メモ #meeting #important"

# プロジェクト指定でメモ追加
npx jinfo --project projectA "プロジェクトAのメモ"

# インタラクティブモード
npx jinfo --project projectA
> Please add memo: [ユーザー入力待ち]
```

#### メモの保存形式
- ファイル名: `YYYY-MM-DD.md` (例: `2024-01-15.md`)
- 保存内容:
```markdown
[2024-01-15 14:30:45] メモ内容 #tag1 #tag2
[2024-01-15 15:20:10] 別のメモ
```

### 2. 設定ファイル

#### 設定ファイルパス
`~/.jinfo/config.json`

#### 設定ファイル構造
```json
{
  "version": "1.0.0",
  "defaultProject": "default",
  "projects": {
    "default": {
      "path": "~/Documents/jinfo/default",
      "description": "デフォルトプロジェクト"
    },
    "projectA": {
      "path": "~/Documents/jinfo/projectA",
      "description": "プロジェクトA用メモ"
    }
  },
  "preferences": {
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "HH:mm:ss",
    "defaultTags": [],
    "colorScheme": {
      "success": "green",
      "error": "red",
      "info": "blue",
      "warning": "yellow"
    }
  }
}
```

### 3. コマンド一覧

#### メモ追加
```bash
npx jinfo [メモ内容] [オプション]
```

#### プロジェクト管理
```bash
# プロジェクト一覧
npx jinfo project list

# プロジェクト追加
npx jinfo project add <name> <path>

# プロジェクト切り替え
npx jinfo project switch <name>

# デフォルトプロジェクト設定
npx jinfo project default <name>
```

#### メモ検索
```bash
# キーワード検索
npx jinfo search "キーワード"

# タグ検索
npx jinfo search --tag meeting

# 日付範囲検索
npx jinfo search --from 2024-01-01 --to 2024-01-31

# プロジェクト指定検索
npx jinfo search --project projectA "キーワード"
```

#### メモ一覧
```bash
# 今日のメモ一覧
npx jinfo list

# 特定日のメモ
npx jinfo list --date 2024-01-15

# 最近のメモ（デフォルト7日）
npx jinfo list --recent 10

# プロジェクト指定
npx jinfo list --project projectA
```

### 4. 実装詳細

#### カラー出力 (chalk使用)
```typescript
// logger.ts
import chalk from 'chalk';

export const logger = {
  success: (message: string) => console.log(chalk.green('✓ ' + message)),
  error: (message: string) => console.log(chalk.red('✗ ' + message)),
  info: (message: string) => console.log(chalk.blue('ℹ ' + message)),
  warning: (message: string) => console.log(chalk.yellow('⚠ ' + message))
};
```

#### タイムスタンプ処理
```typescript
import dayjs from 'dayjs';

export const getTimestamp = (): string => {
  return dayjs().format('[[]YYYY-MM-DD HH:mm:ss[]]');
};
```

#### タグ抽出
```typescript
export const extractTags = (content: string): string[] => {
  const tagRegex = /#[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return content.match(tagRegex) || [];
};
```

### 5. package.json設定
```json
{
  "name": "jinfo",
  "version": "1.0.0",
  "description": "シンプルなCLIメモツール",
  "type": "module",
  "bin": {
    "jinfo": "./bin/jinfo.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "prepare": "npm run build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 6. bin/jinfo.js
```javascript
#!/usr/bin/env node
import '../dist/index.js';
```

### 7. エラーハンドリング
- 設定ファイルが存在しない場合は自動作成
- 保存先ディレクトリが存在しない場合は自動作成
- 権限エラーの適切な処理とメッセージ表示

### 8. 初回実行時の処理
1. 設定ファイルの自動生成
2. デフォルトプロジェクトの作成
3. 保存先ディレクトリの作成
4. 使い方の簡単な説明表示

## 開発手順
1. プロジェクト初期化: `pnpm init`
2. TypeScript設定: `pnpm add -D typescript @types/node`
3. 依存関係インストール
4. 基本構造の実装
5. 各コマンドの実装
6. テストとデバッグ
7. ビルドとパブリッシュ準備

## 注意事項
- ESMモジュールとして実装（"type": "module"）
- Node.js 18以上を要求
- 日本語対応（タグ、検索、表示）
- クロスプラットフォーム対応（Windows, macOS, Linux）