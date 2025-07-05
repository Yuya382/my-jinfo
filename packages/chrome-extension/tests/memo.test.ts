import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoService } from '../src/services/MemoService';
import { Memo } from '../src/types/Memo';

// Chrome API のモック
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
  },
};

// グローバル chrome オブジェクトをモック
global.chrome = mockChrome as any;

describe('MemoService', () => {
  let memoService: MemoService;

  beforeEach(() => {
    memoService = new MemoService();
    vi.clearAllMocks();
  });

  describe('メモの追加', () => {
    it('新しいメモを追加できること', async () => {
      const memoContent = 'テストメモ';
      const tags = ['#test', '#memo'];
      
      mockChrome.storage.local.get.mockResolvedValue({ memos: [] });
      mockChrome.storage.local.set.mockResolvedValue(undefined);

      await memoService.addMemo(memoContent, tags);

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        memos: expect.arrayContaining([
          expect.objectContaining({
            content: memoContent,
            tags,
            timestamp: expect.any(String),
            id: expect.any(String),
          }),
        ]),
      });
    });

    it('空のメモは追加できないこと', async () => {
      await expect(memoService.addMemo('', [])).rejects.toThrow(
        'メモの内容は必須です'
      );
    });

    it('タグが正しく抽出されること', async () => {
      const memoContent = 'テストメモ #important #work';
      
      mockChrome.storage.local.get.mockResolvedValue({ memos: [] });
      mockChrome.storage.local.set.mockResolvedValue(undefined);

      await memoService.addMemo(memoContent);

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        memos: expect.arrayContaining([
          expect.objectContaining({
            content: memoContent,
            tags: ['#important', '#work'],
          }),
        ]),
      });
    });
  });

  describe('メモの検索', () => {
    const sampleMemos: Memo[] = [
      {
        id: '1',
        content: 'テストメモ #test',
        tags: ['#test'],
        timestamp: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        content: '会議の議事録 #meeting #important',
        tags: ['#meeting', '#important'],
        timestamp: '2024-01-02T00:00:00.000Z',
      },
    ];

    it('キーワードでメモを検索できること', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ memos: sampleMemos });

      const results = await memoService.searchMemos('会議');

      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('会議');
    });

    it('タグでメモを検索できること', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ memos: sampleMemos });

      const results = await memoService.searchMemosByTag('#important');

      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('#important');
    });

    it('複数のタグでメモを検索できること', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ memos: sampleMemos });

      const results = await memoService.searchMemosByTags(['#meeting', '#important']);

      expect(results).toHaveLength(1);
      expect(results[0].tags).toEqual(expect.arrayContaining(['#meeting', '#important']));
    });
  });

  describe('メモの一覧表示', () => {
    it('すべてのメモを取得できること', async () => {
      const sampleMemos: Memo[] = [
        {
          id: '1',
          content: 'メモ1',
          tags: [],
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          content: 'メモ2',
          tags: [],
          timestamp: '2024-01-02T00:00:00.000Z',
        },
      ];

      mockChrome.storage.local.get.mockResolvedValue({ memos: sampleMemos });

      const memos = await memoService.getAllMemos();

      expect(memos).toHaveLength(2);
      expect(memos).toEqual(sampleMemos);
    });

    it('メモが存在しない場合は空の配列を返すこと', async () => {
      mockChrome.storage.local.get.mockResolvedValue({});

      const memos = await memoService.getAllMemos();

      expect(memos).toEqual([]);
    });
  });

  describe('メモの削除', () => {
    it('指定したIDのメモを削除できること', async () => {
      const sampleMemos: Memo[] = [
        {
          id: '1',
          content: 'メモ1',
          tags: [],
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          content: 'メモ2',
          tags: [],
          timestamp: '2024-01-02T00:00:00.000Z',
        },
      ];

      mockChrome.storage.local.get.mockResolvedValue({ memos: sampleMemos });
      mockChrome.storage.local.set.mockResolvedValue(undefined);

      await memoService.deleteMemo('1');

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        memos: [sampleMemos[1]],
      });
    });

    it('存在しないIDのメモを削除しようとした場合はエラーを投げること', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ memos: [] });

      await expect(memoService.deleteMemo('nonexistent')).rejects.toThrow(
        'メモが見つかりません'
      );
    });
  });
});