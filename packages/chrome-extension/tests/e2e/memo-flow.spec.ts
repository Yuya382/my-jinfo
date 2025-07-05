import { test, expect } from '@playwright/test';

test.describe('jinfo Chrome Extension E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // ポップアップページを開く
    await page.goto('chrome-extension://test/src/popup/index.html');
  });

  test('メモの追加と表示', async ({ page }) => {
    // 追加タブをクリック
    await page.click('text=追加');

    // メモを入力
    const testMemo = 'テストメモ #test #important';
    await page.fill('textarea', testMemo);

    // メモを追加
    await page.click('button:has-text("追加")');

    // 一覧タブに戻る
    await page.click('text=一覧');

    // メモが表示されていることを確認
    await expect(page.locator('text=' + testMemo)).toBeVisible();
  });

  test('メモの検索', async ({ page }) => {
    // 検索フィールドに入力
    await page.fill('input[placeholder*="検索"]', 'テスト');

    // 検索結果が表示されることを確認
    await expect(page.locator('text=テスト')).toBeVisible();
  });

  test('タグフィルタ', async ({ page }) => {
    // タグフィルタが表示されることを確認
    await expect(page.locator('text=タグでフィルタ')).toBeVisible();

    // タグをクリック
    await page.click('.tag');

    // フィルタされた結果が表示されることを確認
    await expect(page.locator('.tag-selected')).toBeVisible();
  });

  test('メモの編集', async ({ page }) => {
    // 編集ボタンをクリック
    await page.click('button[title="編集"]');

    // テキストエリアが表示されることを確認
    await expect(page.locator('textarea')).toBeVisible();

    // メモを編集
    await page.fill('textarea', '編集されたメモ #updated');

    // 保存ボタンをクリック
    await page.click('button:has-text("保存")');

    // 編集されたメモが表示されることを確認
    await expect(page.locator('text=編集されたメモ')).toBeVisible();
  });

  test('メモの削除', async ({ page }) => {
    // 削除ボタンをクリック
    await page.click('button[title="削除"]');

    // 確認ダイアログで OK をクリック
    page.on('dialog', dialog => dialog.accept());

    // メモが削除されることを確認
    await expect(page.locator('text=メモがありません')).toBeVisible();
  });
});

test.describe('jinfo Options Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // オプションページを開く
    await page.goto('chrome-extension://test/src/options/index.html');
  });

  test('統計情報の表示', async ({ page }) => {
    // 統計情報が表示されることを確認
    await expect(page.locator('text=統計情報')).toBeVisible();
    await expect(page.locator('text=総メモ数')).toBeVisible();
    await expect(page.locator('text=使用タグ数')).toBeVisible();
  });

  test('データのエクスポート', async ({ page }) => {
    // エクスポートボタンをクリック
    await page.click('button:has-text("エクスポート")');

    // ダウンロードが開始されることを確認
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
  });

  test('データのインポート', async ({ page }) => {
    // ファイル選択ボタンをクリック
    await page.click('button:has-text("ファイルを選択")');

    // ファイル選択ダイアログが表示されることを確認
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('すべてのメモを削除', async ({ page }) => {
    // すべて削除ボタンをクリック
    await page.click('button:has-text("すべて削除")');

    // 確認ダイアログで OK をクリック
    page.on('dialog', dialog => dialog.accept());

    // 削除完了のアラートが表示されることを確認
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('すべてのメモを削除しました');
      dialog.accept();
    });
  });
});