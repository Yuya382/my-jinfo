import React, { useState } from 'react';

interface MemoInputProps {
  onAdd: (content: string, tags: string[]) => void;
  onCancel: () => void;
}

export const MemoInput: React.FC<MemoInputProps> = ({
  onAdd,
  onCancel,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractTags = (text: string): string[] => {
    const tagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
    const tags = text.match(tagRegex) || [];
    return [...new Set(tags)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = extractTags(content);
      await onAdd(content.trim(), tags);
      setContent('');
    } catch (error) {
      console.error('メモの追加に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewTags = extractTags(content);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="メモを入力してください... #タグ を使ってタグ付けできます"
                className="input-field w-full h-32 resize-none"
                autoFocus
              />
            </div>

            {previewTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ (自動検出)
                </label>
                <div className="flex flex-wrap gap-2">
                  {previewTags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>💡 ヒント:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>#タグ名 でタグを追加できます</li>
                <li>日本語のタグにも対応しています</li>
                <li>同じタグは自動的に重複除去されます</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  追加中...
                </>
              ) : (
                '追加'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};