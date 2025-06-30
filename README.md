# jinfo - シンプルなCLIメモツール

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

jinfoは、どこからでも素早くメモを記録できるCLIツールです。デイリーログ形式でメモを保存し、プロジェクトごとに管理できます。

## 特徴

- ✨ **簡単操作**: ワンコマンドでメモを追加
- 📅 **デイリーログ**: 日付ごとにマークダウンファイルで管理
- 🏷️ **タグ機能**: `#tag` 形式でメモを分類
- 📁 **プロジェクト管理**: 複数のプロジェクトでメモを分離
- 🔍 **高速検索**: キーワード、タグ、日付で検索
- 🌐 **日本語対応**: 日本語のタグと内容に完全対応
- 🖥️ **クロスプラットフォーム**: Windows、macOS、Linux対応

## インストール

### npm/pnpmを使用

```bash
# npmの場合
npm install -g jinfo

# pnpmの場合
pnpm add -g jinfo
```

### ソースからビルド

```bash
git clone https://github.com/yourusername/jinfo.git
cd jinfo
pnpm install
pnpm build
npm link
```

## クイックスタート

### 1. 初回実行
初回実行時に設定ファイルとデフォルトプロジェクトが自動作成されます。

```bash
jinfo "初めてのメモ"
# ✓ 設定を保存しました
# ℹ 初期設定を作成しました
# ✓ メモを追加しました: 初めてのメモ
```

### 2. メモの追加
```bash
# 基本的なメモ
jinfo "会議のメモです"

# タグ付きメモ
jinfo "重要な打ち合わせ #会議 #重要"

# プロジェクト指定
jinfo --project work "作業タスク #todo"

# 対話式メモ追加（NEW!）
jinfo interactive
# または
jinfo i
```

### 3. メモの確認
```bash
# 今日のメモ一覧
jinfo list

# 最近7日のメモ
jinfo list --recent 7

# 特定日のメモ
jinfo list --date 2024-01-15
```

## 使用方法

### 基本コマンド

#### メモの追加
```bash
# 基本形式
jinfo "メモ内容"

# インタラクティブモード（内容を後から入力）
jinfo

# プロジェクトを指定
jinfo --project プロジェクト名 "メモ内容"

# 対話式メモ追加（段階的にプロジェクトとメモ内容を選択）
jinfo interactive
jinfo i  # 短縮形
```

#### メモの一覧表示
```bash
# 今日のメモ
jinfo list

# 最近のメモ（デフォルト7日）
jinfo list --recent 10

# 特定日のメモ
jinfo list --date 2024-01-15

# プロジェクト指定
jinfo list --project work
```

#### メモの検索
```bash
# キーワード検索
jinfo search "会議"

# タグ検索
jinfo search --tag 重要 "キーワード"

# 日付範囲検索
jinfo search --from 2024-01-01 --to 2024-01-31 "キーワード"

# プロジェクト内検索
jinfo search --project work "タスク"
```

### プロジェクト管理

#### プロジェクト一覧
```bash
jinfo project list
# プロジェクト一覧:
#   default (デフォルト): デフォルトプロジェクト
#     パス: ~/Documents/jinfo/default
```

#### プロジェクト追加
```bash
jinfo project add work ~/Documents/jinfo/work --description "仕事用メモ"
# ✓ プロジェクト 'work' を追加しました
```

#### デフォルトプロジェクト設定
```bash
jinfo project default work
# ✓ デフォルトプロジェクトを 'work' に設定しました
```

## メモの形式

メモは以下の形式でMarkdownファイルに保存されます：

```markdown
[2024-01-15 14:30:45] 会議のメモ #重要 #会議
[2024-01-15 15:20:10] タスクの進捗確認 #todo
[2024-01-15 16:45:33] アイデア #creative
```

## タグの使用

### タグの書き方
- `#` で始まる文字列
- 英数字、アンダースコア、日本語に対応
- 例: `#重要`, `#meeting`, `#work_item`, `#プロジェクト1`

### タグ検索の例
```bash
# 特定のタグを含むメモを検索
jinfo search --tag 重要 ""

# タグとキーワードの組み合わせ
jinfo search --tag 会議 "議事録"
```

## 設定ファイル

設定ファイルは `~/.jinfo/config.json` に保存されます：

```json
{
  "version": "1.0.0",
  "defaultProject": "default",
  "projects": {
    "default": {
      "path": "~/Documents/jinfo/default",
      "description": "デフォルトプロジェクト"
    },
    "work": {
      "path": "~/Documents/jinfo/work", 
      "description": "仕事用メモ"
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

## 実用例

### 日常的な使用
```bash
# 朝の予定をメモ
jinfo "今日の予定: 10時会議、14時プレゼン #予定"

# 会議中のメモ
jinfo "新機能の要件について議論 #会議 #開発"

# アイデアメモ
jinfo "UIの改善案: ダークモード対応 #アイデア #UI"

# 振り返り
jinfo "今日の成果: 機能実装完了、テスト作成 #振り返り"

# 対話式でじっくりメモを作成
jinfo interactive
# プロジェクトを選択 → メモ内容を入力の順で対話的に実行
```

### プロジェクト別管理
```bash
# プロジェクトA用
jinfo --project projectA "要件定義書レビュー完了 #進捗"

# プロジェクトB用  
jinfo --project projectB "バグ修正対応 #バグ #緊急"

# 個人メモ
jinfo --project personal "読んだ本の感想 #読書"
```

### 検索とレビュー
```bash
# 今週の会議関連メモを確認
jinfo search --tag 会議 --from 2024-01-08 ""

# 重要なタスクを確認
jinfo search --tag 重要 ""

# 特定プロジェクトの進捗確認
jinfo search --project work --tag 進捗 ""
```

## トラブルシューティング

### 設定をリセットする
```bash
# 設定ディレクトリを削除（注意：全データが削除されます）
rm -rf ~/.jinfo
```

### メモファイルの場所
メモファイルは各プロジェクトのパスに `YYYY-MM-DD.md` 形式で保存されています。

デフォルト: `~/Documents/jinfo/default/2024-01-15.md`

### よくある問題

**Q: メモが追加されない**
A: プロジェクトディレクトリへの書き込み権限を確認してください。

**Q: 日本語が正しく表示されない**
A: ターミナルのエンコーディングがUTF-8に設定されているか確認してください。

**Q: プロジェクトが見つからない**
A: `jinfo project list` でプロジェクト一覧を確認してください。

## 動作環境

- **Node.js**: 18.0.0以上
- **OS**: Windows、macOS、Linux
- **ターミナル**: UTF-8対応必須

## ライセンス

ISC License

## 開発・貢献

### 開発環境のセットアップ
```bash
git clone https://github.com/yourusername/jinfo.git
cd jinfo
pnpm install
```

### テストの実行
```bash
# 全テスト実行
pnpm test:run

# ウォッチモード
pnpm test

# カバレッジ付き
pnpm test:coverage
```

### ビルド
```bash
pnpm build
```

## サポート

- [Issues](https://github.com/yourusername/jinfo/issues): バグ報告・機能要望
- [Discussions](https://github.com/yourusername/jinfo/discussions): 質問・議論

---

**jinfo** で効率的なメモ管理を始めましょう！