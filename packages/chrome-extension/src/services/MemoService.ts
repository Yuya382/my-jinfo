import { Memo, MemoSearchOptions, MemoStats } from '../types/Memo';
import dayjs from 'dayjs';

export class MemoService {
  private readonly STORAGE_KEY = 'memos';

  /**
   * メモを追加
   */
  async addMemo(content: string, tags?: string[]): Promise<void> {
    if (!content || content.trim() === '') {
      throw new Error('メモの内容は必須です');
    }

    const extractedTags = tags || this.extractTags(content);
    const memo: Memo = {
      id: this.generateId(),
      content: content.trim(),
      tags: extractedTags,
      timestamp: dayjs().toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    };

    const memos = await this.getAllMemos();
    memos.push(memo);
    await this.saveMemos(memos);
  }

  /**
   * すべてのメモを取得
   */
  async getAllMemos(): Promise<Memo[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY], (result) => {
        resolve(result[this.STORAGE_KEY] || []);
      });
    });
  }

  /**
   * キーワードでメモを検索
   */
  async searchMemos(keyword: string): Promise<Memo[]> {
    const memos = await this.getAllMemos();
    return memos.filter((memo) =>
      memo.content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * タグでメモを検索
   */
  async searchMemosByTag(tag: string): Promise<Memo[]> {
    const memos = await this.getAllMemos();
    return memos.filter((memo) => memo.tags.includes(tag));
  }

  /**
   * 複数のタグでメモを検索
   */
  async searchMemosByTags(tags: string[]): Promise<Memo[]> {
    const memos = await this.getAllMemos();
    return memos.filter((memo) =>
      tags.every((tag) => memo.tags.includes(tag))
    );
  }

  /**
   * 高度な検索
   */
  async searchMemosAdvanced(options: MemoSearchOptions): Promise<Memo[]> {
    const memos = await this.getAllMemos();
    let filteredMemos = memos;

    // キーワード検索
    if (options.keyword) {
      filteredMemos = filteredMemos.filter((memo) =>
        memo.content.toLowerCase().includes(options.keyword!.toLowerCase())
      );
    }

    // タグ検索
    if (options.tag) {
      filteredMemos = filteredMemos.filter((memo) =>
        memo.tags.includes(options.tag!)
      );
    }

    // 複数タグ検索
    if (options.tags && options.tags.length > 0) {
      filteredMemos = filteredMemos.filter((memo) =>
        options.tags!.every((tag) => memo.tags.includes(tag))
      );
    }

    // 日付範囲検索
    if (options.fromDate || options.toDate) {
      filteredMemos = filteredMemos.filter((memo) => {
        const memoDate = dayjs(memo.timestamp);
        if (options.fromDate && memoDate.isBefore(dayjs(options.fromDate))) {
          return false;
        }
        if (options.toDate && memoDate.isAfter(dayjs(options.toDate))) {
          return false;
        }
        return true;
      });
    }

    return filteredMemos;
  }

  /**
   * メモを削除
   */
  async deleteMemo(id: string): Promise<void> {
    const memos = await this.getAllMemos();
    const index = memos.findIndex((memo) => memo.id === id);
    
    if (index === -1) {
      throw new Error('メモが見つかりません');
    }

    memos.splice(index, 1);
    await this.saveMemos(memos);
  }

  /**
   * メモを更新
   */
  async updateMemo(id: string, content: string, tags?: string[]): Promise<void> {
    const memos = await this.getAllMemos();
    const index = memos.findIndex((memo) => memo.id === id);
    
    if (index === -1) {
      throw new Error('メモが見つかりません');
    }

    if (!content || content.trim() === '') {
      throw new Error('メモの内容は必須です');
    }

    const extractedTags = tags || this.extractTags(content);
    memos[index] = {
      ...memos[index],
      content: content.trim(),
      tags: extractedTags,
      updatedAt: dayjs().toISOString(),
    };

    await this.saveMemos(memos);
  }

  /**
   * 統計情報を取得
   */
  async getStats(): Promise<MemoStats> {
    const memos = await this.getAllMemos();
    const tagCounts = new Map<string, number>();

    memos.forEach((memo) => {
      memo.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const mostUsedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalMemos: memos.length,
      totalTags: tagCounts.size,
      mostUsedTags,
    };
  }

  /**
   * メモを保存
   */
  private async saveMemos(memos: Memo[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: memos }, resolve);
    });
  }

  /**
   * テキストからタグを抽出
   */
  private extractTags(text: string): string[] {
    const tagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
    const tags = text.match(tagRegex) || [];
    return [...new Set(tags)]; // 重複を除去
  }

  /**
   * ユニークIDを生成
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}