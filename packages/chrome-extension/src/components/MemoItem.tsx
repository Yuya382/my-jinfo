import React, { useState } from 'react';
import { Memo } from '../types/Memo';
import dayjs from 'dayjs';

interface MemoItemProps {
  memo: Memo;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, content: string, tags: string[]) => void;
}

export const MemoItem: React.FC<MemoItemProps> = ({
  memo,
  isEditing,
  onEdit,
  onDelete,
  onCancelEdit,
  onSaveEdit,
}) => {
  const [editContent, setEditContent] = useState(memo.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const extractTags = (text: string): string[] => {
    const tagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
    const tags = text.match(tagRegex) || [];
    return [...new Set(tags)];
  };

  const handleSave = () => {
    if (editContent.trim()) {
      const tags = extractTags(editContent);
      onSaveEdit(memo.id, editContent.trim(), tags);
    }
  };

  const handleCancel = () => {
    setEditContent(memo.content);
    onCancelEdit();
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    if (window.confirm('このメモを削除しますか？')) {
      setIsDeleting(true);
      try {
        await onDelete(memo.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (timestamp: string): string => {
    return dayjs(timestamp).format('MM/DD HH:mm');
  };

  const formatFullDate = (timestamp: string): string => {
    return dayjs(timestamp).format('YYYY年MM月DD日 HH:mm:ss');
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-field w-full h-24 resize-none"
            autoFocus
          />
          
          {extractTags(editContent).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {extractTags(editContent).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm btn-secondary"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm btn-primary"
              disabled={!editContent.trim()}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <time
              className="text-xs text-gray-500 font-medium"
              title={formatFullDate(memo.timestamp)}
            >
              {formatDate(memo.timestamp)}
            </time>
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={() => onEdit(memo.id)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="編集"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="削除"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
            {memo.content}
          </div>
          
          {memo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {memo.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};