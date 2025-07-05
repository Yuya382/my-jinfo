// Chrome拡張機能の背景スクリプト
chrome.runtime.onInstalled.addListener(() => {
  console.log('jinfo Chrome拡張機能がインストールされました');
});

// アクションボタンクリック時の処理
chrome.action.onClicked.addListener((tab) => {
  // ポップアップが無効になっている場合のみ実行
  console.log('拡張機能がクリックされました', tab);
});

// メッセージ受信処理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMemoCount') {
    // メモ数を取得
    chrome.storage.local.get(['memos'], (result) => {
      const memos = result.memos || [];
      sendResponse({ count: memos.length });
    });
    return true; // 非同期レスポンス
  }
  
  if (request.action === 'updateBadge') {
    // バッジを更新
    chrome.storage.local.get(['memos'], (result) => {
      const memos = result.memos || [];
      const count = memos.length;
      
      chrome.action.setBadgeText({
        text: count > 0 ? count.toString() : '',
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: '#3b82f6',
      });
      
      sendResponse({ success: true });
    });
    return true; // 非同期レスポンス
  }
});

// ストレージ変更時の処理
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.memos) {
    const memos = changes.memos.newValue || [];
    const count = memos.length;
    
    // バッジを更新
    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : '',
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: '#3b82f6',
    });
  }
});

// 拡張機能の初期化
chrome.runtime.onStartup.addListener(() => {
  // バッジを初期化
  chrome.storage.local.get(['memos'], (result) => {
    const memos = result.memos || [];
    const count = memos.length;
    
    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : '',
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: '#3b82f6',
    });
  });
});