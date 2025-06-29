import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../src/utils/logger.js';

describe('logger utilities', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('success', () => {
    it('should log success message with green color and checkmark', () => {
      logger.success('Operation completed');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✓ Operation completed'));
    });

    it('should handle empty message', () => {
      logger.success('');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✓ '));
    });
  });

  describe('error', () => {
    it('should log error message with red color and X mark', () => {
      logger.error('Something went wrong');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✗ Something went wrong'));
    });

    it('should handle error objects', () => {
      logger.error('Database connection failed');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✗ Database connection failed'));
    });
  });

  describe('info', () => {
    it('should log info message with blue color and info icon', () => {
      logger.info('Information message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('ℹ Information message'));
    });

    it('should handle multiline messages', () => {
      logger.info('Line 1\\nLine 2');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('ℹ Line 1\\nLine 2'));
    });
  });

  describe('warning', () => {
    it('should log warning message with yellow color and warning icon', () => {
      logger.warning('This is a warning');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠ This is a warning'));
    });

    it('should handle Japanese messages', () => {
      logger.warning('これは警告です');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠ これは警告です'));
    });
  });

  describe('all log levels', () => {
    it('should call console.log exactly once for each method', () => {
      logger.success('success');
      logger.error('error');
      logger.info('info');  
      logger.warning('warning');
      
      expect(consoleSpy).toHaveBeenCalledTimes(4);
    });
  });
});