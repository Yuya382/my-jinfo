import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';
import path from 'path';
import { MemoWriter } from '../../src/storage/writer.js';
import * as formatterModule from '../../src/utils/formatter.js';

vi.mock('fs');
vi.mock('fs/promises');
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

describe('MemoWriter', () => {
  let memoWriter: MemoWriter;
  const basePath = path.join('test', 'path');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-30T10:00:00Z'));

    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(mkdirSync).mockReturnValue(undefined);
    vi.mocked(appendFile).mockResolvedValue();
    
    memoWriter = new MemoWriter(basePath);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create directory if it does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const newPath = path.join('new', 'path');
      new MemoWriter(newPath);
      
      expect(mkdirSync).toHaveBeenCalledWith(newPath, { recursive: true });
    });

    it('should not create directory if it exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const existingPath = path.join('existing', 'path');
      new MemoWriter(existingPath);
      
      expect(mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('addMemo', () => {
    it('should add memo with current date when no date specified', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2025-06-30 10:00:00] Test memo');
      
      await memoWriter.addMemo('Test memo');

      expect(formatMemoSpy).toHaveBeenCalledWith('Test memo');
      const expectedPath = path.join(basePath, '2025-06-30.md');
      expect(appendFile).toHaveBeenCalledWith(
        expectedPath,
        '[2025-06-30 10:00:00] Test memo\n',
        'utf-8'
      );
    });

    it('should add memo with specified date', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] Test memo');
      
      await memoWriter.addMemo('Test memo', '2024-01-15');

      expect(formatMemoSpy).toHaveBeenCalledWith('Test memo');
      const expectedPath = path.join(basePath, '2024-01-15.md');
      expect(appendFile).toHaveBeenCalledWith(
        expectedPath,
        '[2024-01-15 14:30:45] Test memo\n',
        'utf-8'
      );
    });

    it('should handle memo with tags', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2025-06-30 10:00:00] Meeting notes #meeting #important');
      
      await memoWriter.addMemo('Meeting notes #meeting #important');

      expect(formatMemoSpy).toHaveBeenCalledWith('Meeting notes #meeting #important');
      const expectedPath = path.join(basePath, '2025-06-30.md');
      expect(appendFile).toHaveBeenCalledWith(
        expectedPath,
        '[2025-06-30 10:00:00] Meeting notes #meeting #important\n',
        'utf-8'
      );
    });

    it('should handle empty memo content', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2025-06-30 10:00:00] ');
      
      await memoWriter.addMemo('');

      expect(formatMemoSpy).toHaveBeenCalledWith('');
      const expectedPath = path.join(basePath, '2025-06-30.md');
      expect(appendFile).toHaveBeenCalledWith(
        expectedPath,
        '[2025-06-30 10:00:00] \n',
        'utf-8'
      );
    });

    it('should throw error when file write fails', async () => {
      vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2025-06-30 10:00:00] Test memo');
      vi.mocked(appendFile).mockRejectedValue(new Error('Write failed'));

      await expect(memoWriter.addMemo('Test memo')).rejects.toThrow('Write failed');
    });

    it('should handle Japanese content', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2025-06-30 10:00:00] 会議のメモ #重要');
      
      await memoWriter.addMemo('会議のメモ #重要');

      expect(formatMemoSpy).toHaveBeenCalledWith('会議のメモ #重要');
      const expectedPath = path.join(basePath, '2025-06-30.md');
      expect(appendFile).toHaveBeenCalledWith(
        expectedPath,
        '[2025-06-30 10:00:00] 会議のメモ #重要\n',
        'utf-8'
      );
    });

    it('should use correct file path format', async () => {
      vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] Test memo');
      
      await memoWriter.addMemo('Test memo', '2024-01-15');
      const expectedPath = path.join(basePath, '2024-01-15.md');
      expect(appendFile).toHaveBeenCalledWith(
        expectedPath,
        expect.any(String),
        'utf-8'
      );
    });
  });
});