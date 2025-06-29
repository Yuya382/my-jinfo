# jinfo API リファレンス

## コマンドライン インターフェース

### 基本構文
```bash
jinfo [options] [command] [arguments]
```

## グローバルオプション

### `--version, -V`
バージョン情報を表示します。

```bash
jinfo --version
# 1.0.0
```

### `--help, -h`
ヘルプ情報を表示します。

```bash
jinfo --help
```

### `--project, -p <name>`
操作対象のプロジェクトを指定します。

```bash
jinfo --project work "作業メモ"
jinfo list --project personal
```

## メインコマンド

### メモ追加（デフォルトアクション）

#### 構文
```bash
jinfo [options] [memo]
```

#### 引数
- `memo` (optional): メモ内容。省略時はインタラクティブモードになります。

#### オプション
- `--project, -p <name>`: プロジェクトを指定

#### 例
```bash
# 基本的なメモ追加
jinfo "会議の議事録"

# タグ付きメモ
jinfo "重要なタスク #重要 #TODO"

# プロジェクト指定
jinfo --project work "作業ログ"

# インタラクティブモード
jinfo
# Please add memo: [ユーザー入力待ち]
```

#### 戻り値
- 成功時: 0
- エラー時: 1

## サブコマンド

### `list` - メモ一覧表示

#### 構文
```bash
jinfo list [options]
```

#### オプション
- `--date, -d <date>`: 特定日のメモを表示 (YYYY-MM-DD形式)
- `--recent, -r <days>`: 最近の指定日数のメモを表示 (デフォルト: 7)
- `--project, -p <name>`: 指定プロジェクトのメモのみ表示

#### 例
```bash
# 今日のメモ
jinfo list

# 特定日のメモ
jinfo list --date 2024-01-15

# 最近10日のメモ
jinfo list --recent 10

# プロジェクト指定
jinfo list --project work

# プロジェクトの最近のメモ
jinfo list --project work --recent 5
```

#### 出力形式
```
[2024-01-15 14:30:45] メモ内容 #タグ1 #タグ2
[2024-01-15 15:20:10] 別のメモ内容
```

### `search` - メモ検索

#### 構文
```bash
jinfo search [options] <query>
```

#### 引数
- `query` (required): 検索キーワード

#### オプション
- `--tag, -t <tag>`: 指定タグでフィルタリング
- `--from, -f <date>`: 開始日を指定 (YYYY-MM-DD形式)
- `--to <date>`: 終了日を指定 (YYYY-MM-DD形式)
- `--project, -p <name>`: 指定プロジェクト内で検索

#### 例
```bash
# キーワード検索
jinfo search "会議"

# タグ検索
jinfo search --tag 重要 ""

# タグとキーワードの組み合わせ
jinfo search --tag 会議 "議事録"

# 日付範囲検索
jinfo search --from 2024-01-01 --to 2024-01-31 "プロジェクト"

# プロジェクト内検索
jinfo search --project work "タスク"

# 複合検索
jinfo search --project work --tag 緊急 --from 2024-01-01 "バグ"
```

#### 検索ロジック
- **キーワード**: 大文字小文字を区別しない部分一致
- **タグ**: 完全一致（#は省略可能）
- **日付範囲**: 指定された範囲内のメモファイルのみが対象
- **複数条件**: AND条件で絞り込み

### `project` - プロジェクト管理

#### 構文
```bash
jinfo project <subcommand> [arguments] [options]
```

#### サブコマンド

##### `list` - プロジェクト一覧
```bash
jinfo project list
```

**出力例:**
```
プロジェクト一覧:
  default (デフォルト): デフォルトプロジェクト
    パス: ~/Documents/jinfo/default
  work: 仕事用メモ
    パス: ~/Documents/jinfo/work
```

##### `add` - プロジェクト追加
```bash
jinfo project add <name> <path> [options]
```

**引数:**
- `name` (required): プロジェクト名
- `path` (required): メモの保存先パス

**オプション:**
- `--description, -d <desc>`: プロジェクトの説明

**例:**
```bash
jinfo project add work ~/Documents/jinfo/work
jinfo project add personal ~/Documents/personal-notes --description "個人用メモ"
```

##### `default` - デフォルトプロジェクト設定
```bash
jinfo project default <name>
```

**引数:**
- `name` (required): デフォルトに設定するプロジェクト名

**例:**
```bash
jinfo project default work
```

## ファイルフォーマット

### メモファイル形式
- ファイル名: `YYYY-MM-DD.md`
- 形式: Markdown
- エンコーディング: UTF-8

#### 内容例
```markdown
[2024-01-15 14:30:45] 会議の議事録 #会議 #重要
[2024-01-15 15:20:10] タスクの進捗確認 #TODO
[2024-01-15 16:45:33] アイデアメモ #アイデア
```

### タグ形式
- パターン: `#[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+`
- 例: `#重要`, `#meeting`, `#work_item`, `#プロジェクト1`

### 設定ファイル形式

#### 場所
```
~/.jinfo/config.json
```

#### 構造
```json
{
  "version": "1.0.0",
  "defaultProject": "default",
  "projects": {
    "default": {
      "path": "~/Documents/jinfo/default",
      "description": "デフォルトプロジェクト"
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

## エラーコード

### 終了ステータス
- `0`: 正常終了
- `1`: エラー終了

### 一般的なエラー

#### プロジェクト関連
```bash
# 存在しないプロジェクトを指定
jinfo --project nonexistent "メモ"
# ✗ エラーが発生しました: プロジェクト 'nonexistent' が見つかりません

# 既存プロジェクト名で追加しようとした場合
jinfo project add default /path
# ✗ エラーが発生しました: プロジェクト 'default' は既に存在します
```

#### 検索関連
```bash
# 検索クエリが不足
jinfo search
# ✗ エラーが発生しました: [コマンドエラー]
```

#### 権限関連
```bash
# 書き込み権限がない場合
jinfo "テストメモ"
# ✗ エラーが発生しました: [権限エラーの詳細]
```

## 出力フォーマット

### 成功メッセージ
- `✓ メモを追加しました: [内容]`
- `✓ プロジェクト '[名前]' を追加しました`
- `✓ デフォルトプロジェクトを '[名前]' に設定しました`
- `✓ 設定を保存しました`

### 情報メッセージ
- `ℹ 初期設定を作成しました`
- `ℹ メモが見つかりませんでした`
- `ℹ 検索結果が見つかりませんでした`

### エラーメッセージ
- `✗ エラーが発生しました: [詳細]`

### カラーリング
- 成功: 緑色 (✓)
- 情報: 青色 (ℹ)
- 警告: 黄色 (⚠)
- エラー: 赤色 (✗)

## パフォーマンス考慮事項

### ファイルアクセス
- メモファイルは日付単位で分割されているため、大量のメモがあってもパフォーマンスが維持されます
- 検索時は対象期間のファイルのみが読み込まれます

### メモリ使用量
- ファイルは必要時のみメモリに読み込まれます
- 大きなプロジェクトでも軽快に動作します

### 同期と並行性
- 複数のjinfoプロセスが同時に実行されても安全です
- ファイルロックは実装されていないため、外部エディタとの同時編集時は注意が必要です

## 統合とエクステンション

### 外部ツールとの連携

#### Git統合
```bash
cd ~/Documents/jinfo/work
git init
git add .
git commit -m "Initial memo commit"
```

#### エディタ統合
メモファイルは標準的なMarkdown形式のため、任意のエディタで編集できます：

```bash
# VS Codeで開く
code ~/Documents/jinfo/default/2024-01-15.md

# Vimで開く
vim ~/Documents/jinfo/default/2024-01-15.md
```

#### シェルエイリアス
便利なエイリアスの例：

```bash
# .bashrc または .zshrc に追加
alias jw='jinfo --project work'
alias jp='jinfo --project personal'
alias jl='jinfo list'
alias js='jinfo search'
```

この API リファレンスにより、jinfoの全機能を詳細に理解し、効果的に活用できるでしょう。