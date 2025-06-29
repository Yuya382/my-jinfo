import dayjs from 'dayjs';

export const getTimestamp = (): string => {
  return dayjs().format('[[]YYYY-MM-DD HH:mm:ss[]]');
};

export const extractTags = (content: string): string[] => {
  const tagRegex = /#[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return content.match(tagRegex) || [];
};

export const formatMemo = (content: string): string => {
  const timestamp = getTimestamp();
  return `${timestamp} ${content}`;
};