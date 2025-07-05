export interface Memo {
  id: string;
  content: string;
  tags: string[];
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemoSearchOptions {
  keyword?: string;
  tag?: string;
  tags?: string[];
  fromDate?: string;
  toDate?: string;
}

export interface MemoStats {
  totalMemos: number;
  totalTags: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
}