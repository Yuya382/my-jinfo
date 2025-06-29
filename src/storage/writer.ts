import { appendFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';
import { formatMemo } from '../utils/formatter.js';
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
      
      const formattedMemo = formatMemo(content) + '\n';
      
      await new Promise<void>((resolve, reject) => {
        appendFile(filepath, formattedMemo, 'utf-8', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      logger.success(`メモを追加しました: ${content}`);
    } catch (error) {
      logger.error(`メモの追加に失敗しました: ${error}`);
      throw error;
    }
  }
}