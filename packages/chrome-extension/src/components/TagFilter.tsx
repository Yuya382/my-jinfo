import React from 'react';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onTagToggle,
}) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">タグでフィルタ</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            className={`tag ${
              selectedTags.includes(tag) ? 'tag-selected' : ''
            } hover:bg-blue-200 transition-colors cursor-pointer`}
          >
            {tag}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <button
          onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          フィルタをクリア
        </button>
      )}
    </div>
  );
};