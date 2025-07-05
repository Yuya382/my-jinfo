import React, { useState } from 'react';
import { Memo } from '../types/Memo';
import { MemoItem } from './MemoItem';

interface MemoListProps {
  memos: Memo[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string, tags: string[]) => void;
}

export const MemoList: React.FC<MemoListProps> = ({
  memos,
  onDelete,
  onUpdate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (id: string, content: string, tags: string[]) => {
    onUpdate(id, content, tags);
    setEditingId(null);
  };

  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium">メモがありません</p>
        <p className="text-sm">「追加」タブからメモを作成してください</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {memos.map((memo) => (
        <MemoItem
          key={memo.id}
          memo={memo}
          isEditing={editingId === memo.id}
          onEdit={handleEdit}
          onDelete={onDelete}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
      ))}
    </div>
  );
};