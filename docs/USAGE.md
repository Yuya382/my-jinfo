# jinfo 使用ガイド

## 目次
1. [基本的な使用方法](#基本的な使用方法)
2. [プロジェクト管理](#プロジェクト管理)
3. [検索とフィルタリング](#検索とフィルタリング)
4. [タグシステム](#タグシステム)
5. [実践的なワークフロー](#実践的なワークフロー)
6. [設定とカスタマイズ](#設定とカスタマイズ)

## 基本的な使用方法

### メモの追加

#### シンプルなメモ
```bash
jinfo "今日は良い天気"
# ✓ メモを追加しました: 今日は良い天気
```

#### タグ付きメモ
```bash
jinfo "重要な会議の議事録 #会議 #重要"
# ✓ メモを追加しました: 重要な会議の議事録 #会議 #重要
```

#### インタラクティブモード
```bash
jinfo
# Please add memo: [ここでメモを入力]
```

#### 対話式メモ追加（NEW!）
```bash
jinfo interactive
# または短縮形
jinfo i

# 実行すると以下の順序で対話的に入力:
# 1. プロジェクト選択（設定済みプロジェクトから選択）
# 2. メモ内容入力（バリデーション付き）
# 3. 自動保存とフィードバック表示
```

#### プロジェクト指定
```bash
jinfo --project work "作業ログ #進捗"
# ✓ メモを追加しました: 作業ログ #進捗
```

### メモの確認

#### 今日のメモ一覧
```bash
jinfo list
# [2024-01-15 14:30:45] 今日は良い天気
# [2024-01-15 15:20:10] 重要な会議の議事録 #会議 #重要
```

#### 最近のメモ
```bash
# 最近7日間（デフォルト）
jinfo list --recent

# 最近10日間
jinfo list --recent 10
```

#### 特定日のメモ
```bash
jinfo list --date 2024-01-15
```

#### プロジェクト指定での一覧
```bash
jinfo list --project work
```

## プロジェクト管理

### プロジェクトの概念
jinfoでは「プロジェクト」という単位でメモを分離管理できます。仕事、個人、趣味など用途に応じてメモを整理できます。

### プロジェクト操作

#### プロジェクト一覧表示
```bash
jinfo project list
# プロジェクト一覧:
#   default (デフォルト): デフォルトプロジェクト
#     パス: ~/Documents/jinfo/default
#   work: 仕事用メモ
#     パス: ~/Documents/jinfo/work
```

#### 新しいプロジェクトの追加
```bash
jinfo project add personal ~/Documents/jinfo/personal --description "個人用メモ"
# ✓ プロジェクト 'personal' を追加しました
```

#### デフォルトプロジェクトの変更
```bash
jinfo project default work
# ✓ デフォルトプロジェクトを 'work' に設定しました
```

### プロジェクトの使い分け例

```bash
# 仕事関連
jinfo --project work "クライアントとの打ち合わせ #会議 #重要"

# 個人メモ
jinfo --project personal "読書メモ: 〇〇の本 #読書"

# 学習記録
jinfo --project study "TypeScript学習進捗 #学習 #TypeScript"
```

## 検索とフィルタリング

### 基本的な検索

#### キーワード検索
```bash
jinfo search "会議"
# 「会議」を含むすべてのメモを表示
```

#### 大文字小文字の区別なし
```bash
jinfo search "MEETING"  # "meeting"も検索対象
```

### 高度な検索オプション

#### タグによる検索
```bash
jinfo search --tag 重要 ""
# #重要 タグが付いたメモのみ表示

jinfo search --tag 会議 "議事録"
# #会議 タグが付いていて「議事録」を含むメモ
```

#### 日付範囲での検索
```bash
jinfo search --from 2024-01-01 --to 2024-01-31 "プロジェクト"
# 1月中の「プロジェクト」を含むメモ
```

#### プロジェクト内検索
```bash
jinfo search --project work "タスク"
# workプロジェクト内で「タスク」を含むメモ
```

#### 複合検索
```bash
jinfo search --project work --tag 緊急 --from 2024-01-01 "バグ"
# workプロジェクトで1月以降の#緊急タグ付き「バグ」メモ
```

## タグシステム

### タグの書き方

#### 基本ルール
- `#` で始まる
- 英数字、アンダースコア、日本語を使用可能
- スペースは含められない

#### 有効なタグ例
```bash
#重要
#meeting
#work_item
#プロジェクト1
#TODO
#アイデア
#bug_fix
```

#### 無効なタグ例
```bash
#重要 事項    # スペースが含まれている
#123         # 数字のみ
```

### タグの活用パターン

#### カテゴリ分類
```bash
jinfo "新機能のアイデア #アイデア #製品"
jinfo "バグ修正完了 #バグ #完了"
jinfo "来週の予定確認 #予定 #TODO"
```

#### 優先度管理
```bash
jinfo "緊急対応が必要 #緊急 #高優先度"
jinfo "時間があるときに対応 #低優先度"
```

#### ステータス管理
```bash
jinfo "タスク開始 #進行中"
jinfo "レビュー待ち #レビュー待ち"
jinfo "作業完了 #完了"
```

#### プロジェクト内分類
```bash
jinfo --project web "フロントエンド実装 #フロントエンド #開発"
jinfo --project web "API設計レビュー #バックエンド #レビュー"
```

## 実践的なワークフロー

### 日次ワークフロー

#### 朝の予定確認とメモ
```bash
# 今日の予定をメモ
jinfo "今日のタスク: 機能実装、コードレビュー、会議 #予定"

# 昨日のメモを確認
jinfo list --date 2024-01-14
```

#### 作業中のメモ
```bash
# 進捗メモ
jinfo "機能A実装50%完了 #進捗 #開発"

# 課題メモ
jinfo "API連携でエラー発生、調査中 #課題 #バグ"

# アイデアメモ
jinfo "UI改善案: ボタンの配置変更 #アイデア #UI"

# 対話式でじっくり考えながらメモ作成
jinfo interactive
# プロジェクトを選んでから詳細なメモを作成
```

#### 夕方の振り返り
```bash
# 今日の成果
jinfo "機能A実装完了、テスト作成開始 #完了 #振り返り"

# 明日への引き継ぎ
jinfo "明日: テスト完了、デプロイ準備 #TODO #明日"
```

### 週次ワークフロー

#### 週の振り返り
```bash
# 今週の重要事項を確認
jinfo search --tag 重要 --from 2024-01-08 --to 2024-01-14 ""

# 完了タスクの確認
jinfo search --tag 完了 --from 2024-01-08 --to 2024-01-14 ""

# 来週への引き継ぎ事項
jinfo search --tag TODO --from 2024-01-08 --to 2024-01-14 ""
```

### プロジェクト管理ワークフロー

#### プロジェクト開始時
```bash
# 新しいプロジェクトの作成
jinfo project add mobile_app ~/Documents/jinfo/mobile_app --description "モバイルアプリ開発"

# プロジェクトの初期メモ
jinfo --project mobile_app "プロジェクト開始 #開始 #計画"
jinfo --project mobile_app "要件定義書確認 #要件 #TODO"
```

#### プロジェクト進行中
```bash
# 定期的な進捗確認
jinfo search --project mobile_app --tag 進捗 ""

# 課題の管理
jinfo search --project mobile_app --tag 課題 ""
```

#### プロジェクト完了時
```bash
# 完了メモ
jinfo --project mobile_app "プロジェクト完了！ #完了 #成功"

# 振り返りメモ
jinfo --project mobile_app "学んだこと: React Nativeのベストプラクティス #学習 #振り返り"
```

### 学習記録ワークフロー

```bash
# 学習開始
jinfo --project study "TypeScript学習開始 #学習 #TypeScript #開始"

# 学習メモ
jinfo --project study "型定義の書き方を学習 #TypeScript #型定義"
jinfo --project study "ジェネリクスが理解できた！ #TypeScript #ジェネリクス #理解"

# 学習振り返り
jinfo search --project study --tag 学習 ""
```

## 設定とカスタマイズ

### 設定ファイルの場所
```
~/.jinfo/config.json
```

### 設定ファイルの構造
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

### カスタマイズ例

#### プロジェクトパスの変更
手動で設定ファイルを編集してプロジェクトの保存先を変更できます：

```json
{
  "projects": {
    "work": {
      "path": "/path/to/your/work/notes",
      "description": "仕事用メモ"
    }
  }
}
```

#### 既存メモファイルとの統合
既存のマークダウンファイルがある場合、プロジェクトのパスを既存ファイルのディレクトリに設定することで統合できます。

## ヒントとコツ

### 効率的なタグ使用
1. **一貫性を保つ**: 同じ概念には同じタグを使用
2. **階層化**: `#開発_フロント`, `#開発_バック` のような階層的なタグ
3. **短くわかりやすく**: `#重要` > `#とても重要な事項`

### 検索のコツ
1. **部分一致**: "会議" で "定例会議", "緊急会議" なども検索可能
2. **タグ組み合わせ**: 複数の検索条件を組み合わせて絞り込み
3. **日付範囲**: 期間を限定して関連メモを確認

### ファイル管理
- メモファイルは標準的なMarkdown形式
- 外部エディタでも編集可能
- Gitなどでバージョン管理も可能

この使用ガイドを参考に、jinfoを使った効率的なメモ管理を始めてください！