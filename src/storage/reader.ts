import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';
import { extractTags } from '../utils/formatter.js';
import { logger } from '../utils/logger.js';

interface MemoEntry {
  timestamp: string;
  content: string;
  tags: string[];
  date: string;
}

export class MemoReader {
  constructor(private basePath: string) {}

  async readMemos(date?: string): Promise<MemoEntry[]> {
    try {
      const targetDate = date || dayjs().format('YYYY-MM-DD');
      const filename = `${targetDate}.md`;
      const filepath = join(this.basePath, filename);

      if (!existsSync(filepath)) {
        return [];
      }

      const content = await readFile(filepath, 'utf-8');
      return this.parseMemos(content, targetDate);
    } catch (error) {
      logger.error(`メモの読み込みに失敗しました: ${error}`);
      return [];
    }
  }

  async readRecentMemos(days: number = 7): Promise<MemoEntry[]> {
    try {
      const allMemos: MemoEntry[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        const memos = await this.readMemos(date);
        allMemos.push(...memos);
      }

      return allMemos.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      logger.error(`最近のメモの読み込みに失敗しました: ${error}`);
      return [];
    }
  }

  async searchMemos(query: string, options?: {
    tag?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<MemoEntry[]> {
    try {
      const files = await readdir(this.basePath);
      const memoFiles = files.filter(file => file.endsWith('.md'));
      
      let allMemos: MemoEntry[] = [];
      
      for (const file of memoFiles) {
        const date = file.replace('.md', '');
        
        if (options?.fromDate && date < options.fromDate) continue;
        if (options?.toDate && date > options.toDate) continue;
        
        const memos = await this.readMemos(date);
        allMemos.push(...memos);
      }

      return allMemos.filter(memo => {
        const matchesQuery = memo.content.toLowerCase().includes(query.toLowerCase());
        const matchesTag = !options?.tag || memo.tags.includes(`#${options.tag}`);
        
        return matchesQuery && matchesTag;
      }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      logger.error(`メモの検索に失敗しました: ${error}`);
      return [];
    }
  }

  private parseMemos(content: string, date: string): MemoEntry[] {
    const lines = content.split('\n').filter(line => line.trim());
    const memos: MemoEntry[] = [];

    for (const line of lines) {
      const match = line.match(/^\[(.+?)\]\s*(.+)$/);
      if (match) {
        const [, timestamp, memoContent] = match;
        const tags = extractTags(memoContent);
        
        memos.push({
          timestamp,
          content: memoContent,
          tags,
          date
        });
      }
    }

    return memos;
  }
}