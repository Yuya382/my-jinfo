import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTimestamp, extractTags, formatMemo } from '../../src/utils/formatter.js';
import dayjs from 'dayjs';

describe('formatter utilities', () => {
  describe('getTimestamp', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return timestamp in correct format', () => {
      const mockDate = '2024-01-15 14:30:45';
      vi.spyOn(dayjs.prototype, 'format').mockReturnValue('[2024-01-15 14:30:45]');
      
      const timestamp = getTimestamp();
      expect(timestamp).toBe('[2024-01-15 14:30:45]');
    });

    it('should use current date when no date provided', () => {
      const formatSpy = vi.spyOn(dayjs.prototype, 'format');
      getTimestamp();
      expect(formatSpy).toHaveBeenCalledWith('[[]YYYY-MM-DD HH:mm:ss[]]');
    });
  });

  describe('extractTags', () => {
    it('should extract English tags', () => {
      const content = 'This is a memo #important #work';
      const tags = extractTags(content);
      expect(tags).toEqual(['#important', '#work']);
    });

    it('should extract Japanese tags', () => {
      const content = 'これはメモです #重要 #会議';
      const tags = extractTags(content);
      expect(tags).toEqual(['#重要', '#会議']);
    });

    it('should extract mixed tags', () => {
      const content = 'Mixed memo #important #会議 #work_item #テスト123';
      const tags = extractTags(content);
      expect(tags).toEqual(['#important', '#会議', '#work_item', '#テスト123']);
    });

    it('should return empty array when no tags', () => {
      const content = 'This is a memo without tags';
      const tags = extractTags(content);
      expect(tags).toEqual([]);
    });

    it('should handle duplicate tags', () => {
      const content = 'Memo #test #test #different';
      const tags = extractTags(content);
      expect(tags).toEqual(['#test', '#test', '#different']);
    });

    it('should handle empty string', () => {
      const tags = extractTags('');
      expect(tags).toEqual([]);
    });
  });

  describe('formatMemo', () => {
    it('should format memo with timestamp', () => {
      vi.spyOn(dayjs.prototype, 'format').mockReturnValue('[2024-01-15 14:30:45]');
      
      const content = 'Test memo content';
      const formatted = formatMemo(content);
      expect(formatted).toBe('[2024-01-15 14:30:45] Test memo content');
    });

    it('should handle empty content', () => {
      vi.spyOn(dayjs.prototype, 'format').mockReturnValue('[2024-01-15 14:30:45]');
      
      const formatted = formatMemo('');
      expect(formatted).toBe('[2024-01-15 14:30:45] ');
    });

    it('should handle content with tags', () => {
      vi.spyOn(dayjs.prototype, 'format').mockReturnValue('[2024-01-15 14:30:45]');
      
      const content = 'Meeting notes #meeting #important';
      const formatted = formatMemo(content);
      expect(formatted).toBe('[2024-01-15 14:30:45] Meeting notes #meeting #important');
    });
  });
});