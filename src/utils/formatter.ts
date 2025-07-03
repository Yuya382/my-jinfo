import dayjs from 'dayjs';
import type { MemoType } from '../config/types.js';

export const getTimestamp = (): string => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
};

export const extractTags = (content: string): string[] => {
  const tagRegex = /#[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return content.match(tagRegex) || [];
};

export const formatMemo = (content: string): string => {
  const timestamp = getTimestamp();
  return `[${timestamp}] ${content}`;
};

export const formatSemanticMemo = (content: string, memoType?: MemoType): string => {
  const timestamp = getTimestamp();
  
  if (memoType) {
    // セマンティック形式: [timestamp] type(emoji): content
    return `[${timestamp}] ${memoType.key}(${memoType.label}): ${content}`;
  }
  
  // 通常形式
  return `[${timestamp}] ${content}`;
};

export const parseSemanticMemo = (line: string): {
  timestamp: string;
  type?: string;
  emoji?: string;
  content: string;
} => {
  // [2024-01-15 14:30:45] task(✅): 機能実装を完了 #進捗
  const semanticMatch = line.match(/^(\[[\d\s-:]+\])\s*(\w+)\s*\((.+?)\):\s*(.+)$/);
  
  if (semanticMatch) {
    return {
      timestamp: semanticMatch[1],
      type: semanticMatch[2],
      emoji: semanticMatch[3],
      content: semanticMatch[4].trim()
    };
  }
  
  // 通常形式: [2024-01-15 14:30:45] 通常のメモ
  const normalMatch = line.match(/^(\[[\d\s-:]+\])\s*(.+)$/);
  
  if (normalMatch) {
    return {
      timestamp: normalMatch[1],
      content: normalMatch[2].trim()
    };
  }
  
  // フォーマットが不正な場合
  return {
    timestamp: '',
    content: line
  };
};