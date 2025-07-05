import React, { useState, useEffect } from 'react';
import { MemoService } from '../services/MemoService';
import { Memo } from '../types/Memo';
import { MemoList } from '../components/MemoList';
import { MemoInput } from '../components/MemoInput';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';

export const PopupApp: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'add'>('list');

  const memoService = new MemoService();

  useEffect(() => {
    loadMemos();
  }, []);

  useEffect(() => {
    filterMemos();
  }, [memos, searchQuery, selectedTags]);

  const loadMemos = async () => {
    try {
      setIsLoading(true);
      const allMemos = await memoService.getAllMemos();
      setMemos(allMemos.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
      
      // 全てのタグを抽出
      const tagsSet = new Set<string>();
      allMemos.forEach(memo => {
        memo.tags.forEach(tag => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());
    } catch (error) {
      console.error('メモの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMemos = () => {
    let filtered = [...memos];

    // キーワード検索
    if (searchQuery) {
      filtered = filtered.filter(memo =>
        memo.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // タグフィルタ
    if (selectedTags.length > 0) {
      filtered = filtered.filter(memo =>
        selectedTags.every(tag => memo.tags.includes(tag))
      );
    }

    setFilteredMemos(filtered);
  };

  const handleAddMemo = async (content: string, tags: string[]) => {
    try {
      await memoService.addMemo(content, tags);
      await loadMemos();
      setCurrentView('list');
    } catch (error) {
      console.error('メモの追加に失敗しました:', error);
    }
  };

  const handleDeleteMemo = async (id: string) => {
    try {
      await memoService.deleteMemo(id);
      await loadMemos();
    } catch (error) {
      console.error('メモの削除に失敗しました:', error);
    }
  };

  const handleUpdateMemo = async (id: string, content: string, tags: string[]) => {
    try {
      await memoService.updateMemo(id, content, tags);
      await loadMemos();
    } catch (error) {
      console.error('メモの更新に失敗しました:', error);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">📝 jinfo</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              一覧
            </button>
            <button
              onClick={() => setCurrentView('add')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentView === 'add'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              追加
            </button>
          </div>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'list' ? (
          <div className="h-full flex flex-col">
            {/* 検索・フィルタ */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="メモを検索..."
              />
              
              {allTags.length > 0 && (
                <TagFilter
                  tags={allTags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                />
              )}
            </div>

            {/* メモリスト */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <MemoList
                  memos={filteredMemos}
                  onDelete={handleDeleteMemo}
                  onUpdate={handleUpdateMemo}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full">
            <MemoInput
              onAdd={handleAddMemo}
              onCancel={() => setCurrentView('list')}
            />
          </div>
        )}
      </main>
    </div>
  );
};