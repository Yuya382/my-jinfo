import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appendFile, existsSync, mkdirSync } from 'fs';
import { MemoWriter } from '../../src/storage/writer.js';
import * as formatterModule from '../../src/utils/formatter.js';

vi.mock('fs');
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
  const basePath = '/test/path';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(mkdirSync).mockReturnValue(undefined);
    vi.mocked(appendFile).mockImplementation((path, data, encoding, callback) => {
      (callback as Function)(null);
    });
    
    memoWriter = new MemoWriter(basePath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create directory if it does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      
      new MemoWriter('/new/path');
      
      expect(mkdirSync).toHaveBeenCalledWith('/new/path', { recursive: true });
    });

    it('should not create directory if it exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      
      new MemoWriter('/existing/path');
      
      expect(mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('addMemo', () => {
    it('should add memo with current date when no date specified', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] Test memo');
      
      await memoWriter.addMemo('Test memo');

      expect(formatMemoSpy).toHaveBeenCalledWith('Test memo');
      expect(appendFile).toHaveBeenCalledWith(
        expect.stringContaining('2025-06-30.md'),
        '[2024-01-15 14:30:45] Test memo\n',
        'utf-8',
        expect.any(Function)
      );
    });

    it('should add memo with specified date', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] Test memo');
      
      await memoWriter.addMemo('Test memo', '2024-01-15');

      expect(formatMemoSpy).toHaveBeenCalledWith('Test memo');
      expect(appendFile).toHaveBeenCalledWith(
        expect.stringContaining('2024-01-15.md'),
        '[2024-01-15 14:30:45] Test memo\n',
        'utf-8',
        expect.any(Function)
      );
    });

    it('should handle memo with tags', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] Meeting notes #meeting #important');
      
      await memoWriter.addMemo('Meeting notes #meeting #important');

      expect(formatMemoSpy).toHaveBeenCalledWith('Meeting notes #meeting #important');
      expect(appendFile).toHaveBeenCalledWith(
        expect.any(String),
        '[2024-01-15 14:30:45] Meeting notes #meeting #important\n',
        'utf-8',
        expect.any(Function)
      );
    });

    it('should handle empty memo content', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] ');
      
      await memoWriter.addMemo('');

      expect(formatMemoSpy).toHaveBeenCalledWith('');
      expect(appendFile).toHaveBeenCalledWith(
        expect.any(String),
        '[2024-01-15 14:30:45] \n',
        'utf-8',
        expect.any(Function)
      );
    });

    it('should throw error when file write fails', async () => {
      vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] Test memo');
      vi.mocked(appendFile).mockImplementation((path, data, encoding, callback) => {
        (callback as Function)(new Error('Write failed'));
      });

      await expect(memoWriter.addMemo('Test memo')).rejects.toThrow('Write failed');
    });

    it('should handle Japanese content', async () => {
      const formatMemoSpy = vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] 会議のメモ #重要');
      
      await memoWriter.addMemo('会議のメモ #重要');

      expect(formatMemoSpy).toHaveBeenCalledWith('会議のメモ #重要');
      expect(appendFile).toHaveBeenCalledWith(
        expect.any(String),
        '[2024-01-15 14:30:45] 会議のメモ #重要\n',
        'utf-8',
        expect.any(Function)
      );
    });

    it('should use correct file path format', async () => {
      vi.spyOn(formatterModule, 'formatMemo').mockReturnValue('[2024-01-15 14:30:45] Test memo');
      
      await memoWriter.addMemo('Test memo', '2024-01-15');

      expect(appendFile).toHaveBeenCalledWith(
        `${basePath}/2024-01-15.md`,
        expect.any(String),
        'utf-8',
        expect.any(Function)
      );
    });
  });
});