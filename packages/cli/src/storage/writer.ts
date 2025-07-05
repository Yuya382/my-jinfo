import { existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';
import { join } from 'path';
import dayjs from 'dayjs';
import { logger } from '../utils/logger.js';

export class MemoWriter {
  constructor(private basePath: string) {
    if (!existsSync(basePath)) {
      mkdirSync(basePath, { recursive: true });
    }
  }

  async addMemo(content: string, date?: string): Promise<void> {
    try {
      const targetDate = date || dayjs().format('YYYY-MM-DD');
      const filename = `${targetDate}.md`;
      const filepath = join(this.basePath, filename);
      
      const memoToWrite = content + '\n';
      
      await appendFile(filepath, memoToWrite, 'utf-8');
      
      logger.success(`メモを追加しました。`);
    } catch (error) {
      logger.error(`メモの追加に失敗しました: ${error}`);
      throw error;
    }
  }
}