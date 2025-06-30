export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // TypeScriptプロジェクトに適したスコープを定義
    'scope-enum': [
      2,
      'always',
      [
        'core',          // コア機能
        'cli',           // CLI関連
        'interactive',   // 対話式機能
        'semantic',      // セマンティックメモ
        'config',        // 設定管理
        'storage',       // ストレージ
        'utils',         // ユーティリティ
        'project',       // プロジェクト管理
        'search',        // 検索機能
        'types',         // 型定義
        'docs',          // ドキュメント
        'test',          // テスト
        'deps',          // 依存関係
        'build',         // ビルド
        'ci',            // CI/CD
      ],
    ],
    // 件名の最大長を日本語対応で調整
    'subject-max-length': [2, 'always', 72],
    // 件名の最小長
    'subject-min-length': [2, 'always', 3],
    // 件名は小文字で始める
    'subject-case': [2, 'always', 'lower-case'],
    // 本文の最大行長
    'body-max-line-length': [2, 'always', 100],
    // フッターの最大行長
    'footer-max-line-length': [2, 'always', 100],
  },
};