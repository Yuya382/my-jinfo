import React, { useState, useEffect } from 'react';
import { MemoService } from '../services/MemoService';
import { MemoStats } from '../types/Memo';

export const OptionsApp: React.FC = () => {
  const [stats, setStats] = useState<MemoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const memoService = new MemoService();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const memoStats = await memoService.getStats();
      setStats(memoStats);
    } catch (error) {
      console.error('統計情報の読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportStatus('loading');
      const memos = await memoService.getAllMemos();
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        memos: memos,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jinfo-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('エクスポートに失敗しました:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('loading');
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.memos || !Array.isArray(data.memos)) {
        throw new Error('無効なファイル形式です');
      }
      
      // 既存のメモを取得
      const existingMemos = await memoService.getAllMemos();
      const existingIds = new Set(existingMemos.map(memo => memo.id));
      
      // 重複しないメモのみを追加
      const newMemos = data.memos.filter((memo: any) => !existingIds.has(memo.id));
      
      // 新しいメモを追加
      for (const memo of newMemos) {
        await memoService.addMemo(memo.content, memo.tags);
      }
      
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
      
      // 統計情報を更新
      await loadStats();
    } catch (error) {
      console.error('インポートに失敗しました:', error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
    
    // ファイル選択をリセット
    event.target.value = '';
  };

  const handleClearAll = async () => {
    if (window.confirm('すべてのメモを削除しますか？この操作は取り消せません。')) {
      try {
        await chrome.storage.local.clear();
        await loadStats();
        alert('すべてのメモを削除しました');
      } catch (error) {
        console.error('メモの削除に失敗しました:', error);
        alert('メモの削除に失敗しました');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">📝 jinfo 設定</h1>
            <p className="text-gray-600 mt-1">メモ管理の設定と統計情報</p>
          </div>

          <div className="p-6 space-y-8">
            {/* 統計情報 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">統計情報</h2>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalMemos}</div>
                    <div className="text-sm text-blue-800">総メモ数</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.totalTags}</div>
                    <div className="text-sm text-green-800">使用タグ数</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.mostUsedTags.length > 0 ? stats.mostUsedTags[0].tag : 'なし'}
                    </div>
                    <div className="text-sm text-purple-800">最も使用されたタグ</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">統計情報を読み込めませんでした</div>
              )}

              {stats && stats.mostUsedTags.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">よく使用されるタグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.mostUsedTags.slice(0, 10).map(({ tag, count }) => (
                      <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {tag}
                        <span className="ml-1 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                          {count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* データの管理 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">データの管理</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">エクスポート</h3>
                    <p className="text-sm text-gray-600">すべてのメモをJSONファイルとして保存</p>
                  </div>
                  <button
                    onClick={handleExport}
                    disabled={exportStatus === 'loading'}
                    className="btn-primary"
                  >
                    {exportStatus === 'loading' ? '準備中...' : 'エクスポート'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">インポート</h3>
                    <p className="text-sm text-gray-600">JSONファイルからメモを読み込み</p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={importStatus === 'loading'}
                    />
                    <button
                      disabled={importStatus === 'loading'}
                      className="btn-secondary"
                    >
                      {importStatus === 'loading' ? '読み込み中...' : 'ファイルを選択'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h3 className="text-md font-medium text-red-900">すべて削除</h3>
                    <p className="text-sm text-red-600">すべてのメモを完全に削除します（取り消せません）</p>
                  </div>
                  <button
                    onClick={handleClearAll}
                    className="btn-danger"
                  >
                    すべて削除
                  </button>
                </div>
              </div>
            </section>

            {/* ステータスメッセージ */}
            {(exportStatus !== 'idle' || importStatus !== 'idle') && (
              <section>
                <div className="space-y-2">
                  {exportStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="text-sm text-green-800">✅ エクスポートが完了しました</div>
                    </div>
                  )}
                  {exportStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-sm text-red-800">❌ エクスポートに失敗しました</div>
                    </div>
                  )}
                  {importStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="text-sm text-green-800">✅ インポートが完了しました</div>
                    </div>
                  )}
                  {importStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-sm text-red-800">❌ インポートに失敗しました</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 使用方法 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">使用方法</h2>
              <div className="prose prose-sm max-w-none">
                <ul className="space-y-2 text-gray-600">
                  <li>• ツールバーの jinfo アイコンをクリックしてメモを管理</li>
                  <li>• テキストに #タグ名 を含めることでタグを自動的に抽出</li>
                  <li>• 検索機能でメモを素早く見つけることができます</li>
                  <li>• メモはブラウザのローカルストレージに安全に保存されます</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};