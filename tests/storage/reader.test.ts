import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { MemoReader } from '../../src/storage/reader.js';

vi.mock('fs/promises');
vi.mock('fs');
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

describe('MemoReader', () => {
  let memoReader: MemoReader;
  const basePath = '/test/path';

  beforeEach(() => {
    vi.clearAllMocks();
    memoReader = new MemoReader(basePath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('readMemos', () => {
    it('should read and parse memos from file', async () => {
      const mockContent = `[2024-01-15 14:30:45] Meeting notes #meeting
[2024-01-15 15:20:10] Follow-up task #important`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(mockContent);

      const memos = await memoReader.readMemos('2024-01-15');

      expect(memos).toHaveLength(2);
      expect(memos[0]).toMatchObject({
        timestamp: '2024-01-15 14:30:45',
        content: 'Meeting notes #meeting',
        tags: ['#meeting'],
        date: '2024-01-15'
      });
      expect(memos[1]).toMatchObject({
        timestamp: '2024-01-15 15:20:10',
        content: 'Follow-up task #important',
        tags: ['#important'],
        date: '2024-01-15'
      });
    });

    it('should return empty array when file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const memos = await memoReader.readMemos('2024-01-15');

      expect(memos).toEqual([]);
      expect(readFile).not.toHaveBeenCalled();
    });

    it('should use current date when no date specified', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue('[2024-06-30 14:30:45] Today memo');

      const memos = await memoReader.readMemos();

      expect(existsSync).toHaveBeenCalledWith(expect.stringContaining('2025-06-30.md'));
    });

    it('should handle malformed lines gracefully', async () => {
      const mockContent = `[2024-01-15 14:30:45] Valid memo
Invalid line without timestamp
[2024-01-15 15:20:10] Another valid memo`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(mockContent);

      const memos = await memoReader.readMemos('2024-01-15');

      expect(memos).toHaveLength(2);
      expect(memos[0].content).toBe('Valid memo');
      expect(memos[1].content).toBe('Another valid memo');
    });

    it('should handle empty file', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue('');

      const memos = await memoReader.readMemos('2024-01-15');

      expect(memos).toEqual([]);
    });

    it('should extract multiple tags from content', async () => {
      const mockContent = '[2024-01-15 14:30:45] Task with multiple tags #work #urgent #project1';

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(mockContent);

      const memos = await memoReader.readMemos('2024-01-15');

      expect(memos[0].tags).toEqual(['#work', '#urgent', '#project1']);
    });

    it('should return empty array when read fails', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockRejectedValue(new Error('Read failed'));

      const memos = await memoReader.readMemos('2024-01-15');

      expect(memos).toEqual([]);
    });
  });

  describe('readRecentMemos', () => {
    it('should read memos from multiple days', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-06-30 14:30:45] Today memo')
        .mockResolvedValueOnce('[2024-06-29 14:30:45] Yesterday memo')
        .mockResolvedValueOnce(''); // Empty file for other days

      const memos = await memoReader.readRecentMemos(3);

      expect(memos).toHaveLength(2);
      expect(memos[0].content).toBe('Today memo');
      expect(memos[1].content).toBe('Yesterday memo');
    });

    it('should sort memos by timestamp descending', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-06-30 10:00:00] Later memo')
        .mockResolvedValueOnce('[2024-06-29 15:00:00] Earlier memo but later time')
        .mockResolvedValue('');

      const memos = await memoReader.readRecentMemos(2);

      expect(memos[0].timestamp).toBe('2024-06-30 10:00:00');
      expect(memos[1].timestamp).toBe('2024-06-29 15:00:00');
    });

    it('should default to 7 days when no parameter provided', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      await memoReader.readRecentMemos();

      expect(existsSync).toHaveBeenCalledTimes(7);
    });

    it('should handle read errors gracefully', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockRejectedValue(new Error('Read failed'));

      const memos = await memoReader.readRecentMemos(1);

      expect(memos).toEqual([]);
    });
  });

  describe('searchMemos', () => {
    beforeEach(() => {
      vi.mocked(readdir).mockResolvedValue(['2024-01-15.md', '2024-01-16.md', 'other.txt'] as any);
    });

    it('should search by content query', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-01-15 14:30:45] Meeting notes #meeting')
        .mockResolvedValueOnce('[2024-01-16 14:30:45] Project planning #project');

      const memos = await memoReader.searchMemos('meeting');

      expect(memos).toHaveLength(1);
      expect(memos[0].content).toBe('Meeting notes #meeting');
    });

    it('should search case insensitively', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-01-15 14:30:45] MEETING notes')
        .mockResolvedValueOnce('[2024-01-16 14:30:45] Project planning');

      const memos = await memoReader.searchMemos('meeting');

      expect(memos).toHaveLength(1);
      expect(memos[0].content).toBe('MEETING notes');
    });

    it('should filter by tag', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-01-15 14:30:45] Meeting notes #meeting')
        .mockResolvedValueOnce('[2024-01-16 14:30:45] Project notes #project');

      const memos = await memoReader.searchMemos('notes', { tag: 'meeting' });

      expect(memos).toHaveLength(1);
      expect(memos[0].tags).toContain('#meeting');
    });

    it('should filter by date range', async () => {
      vi.mocked(readdir).mockResolvedValue(['2024-01-10.md', '2024-01-15.md', '2024-01-20.md'] as any);
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-01-15 14:30:45] Middle date memo');

      const memos = await memoReader.searchMemos('memo', {
        fromDate: '2024-01-12',
        toDate: '2024-01-18'
      });

      expect(memos).toHaveLength(1);
      expect(memos[0].date).toBe('2024-01-15');
    });

    it('should combine multiple search criteria', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-01-15 14:30:45] Meeting notes #meeting #important')
        .mockResolvedValueOnce('[2024-01-16 14:30:45] Meeting summary #meeting');

      const memos = await memoReader.searchMemos('notes', { tag: 'important' });

      expect(memos).toHaveLength(1);
      expect(memos[0].content).toBe('Meeting notes #meeting #important');
    });

    it('should sort results by timestamp descending', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce('[2024-01-15 10:00:00] Earlier memo')
        .mockResolvedValueOnce('[2024-01-16 14:30:45] Later memo');

      const memos = await memoReader.searchMemos('memo');

      expect(memos[0].timestamp).toBe('2024-01-16 14:30:45');
      expect(memos[1].timestamp).toBe('2024-01-15 10:00:00');
    });

    it('should handle search errors gracefully', async () => {
      vi.mocked(readdir).mockRejectedValue(new Error('Directory read failed'));

      const memos = await memoReader.searchMemos('query');

      expect(memos).toEqual([]);
    });

    it('should ignore non-md files', async () => {
      vi.mocked(readdir).mockResolvedValue(['2024-01-15.md', 'config.json', '2024-01-16.txt'] as any);
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValueOnce('[2024-01-15 14:30:45] Valid memo');

      const memos = await memoReader.searchMemos('memo');

      expect(readFile).toHaveBeenCalledTimes(1);
      expect(memos).toHaveLength(1);
    });
  });
});