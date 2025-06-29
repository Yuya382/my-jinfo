import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { ConfigManager } from '../../src/config/manager.js';
import type { Config } from '../../src/config/types.js';

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

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let mockConfig: Config;

  beforeEach(() => {
    configManager = new ConfigManager();
    mockConfig = {
      version: '1.0.0',
      defaultProject: 'default',
      projects: {
        default: {
          path: '/home/user/Documents/jinfo/default',
          description: 'デフォルトプロジェクト'
        }
      },
      preferences: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        defaultTags: [],
        colorScheme: {
          success: 'green',
          error: 'red',
          info: 'blue',
          warning: 'yellow'
        }
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadConfig', () => {
    it('should load existing config file', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const config = await configManager.loadConfig();

      expect(config).toEqual(mockConfig);
      expect(readFile).toHaveBeenCalledWith(expect.stringContaining('config.json'), 'utf-8');
    });

    it('should create default config when file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFile).mockResolvedValue();
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const config = await configManager.loadConfig();

      expect(config.version).toBe('1.0.0');
      expect(config.defaultProject).toBe('default');
      expect(config.projects.default).toBeDefined();
    });

    it('should return cached config on subsequent calls', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));

      await configManager.loadConfig();
      await configManager.loadConfig();

      expect(readFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error when config file is invalid JSON', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue('invalid json');

      await expect(configManager.loadConfig()).rejects.toThrow();
    });
  });

  describe('saveConfig', () => {
    it('should save config to file', async () => {
      vi.mocked(writeFile).mockResolvedValue();

      await configManager.saveConfig(mockConfig);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        JSON.stringify(mockConfig, null, 2)
      );
    });

    it('should update cached config after save', async () => {
      vi.mocked(writeFile).mockResolvedValue();
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));

      await configManager.saveConfig(mockConfig);
      const loadedConfig = await configManager.loadConfig();

      expect(loadedConfig).toEqual(mockConfig);
      expect(readFile).not.toHaveBeenCalled(); // Should use cached version
    });

    it('should throw error when save fails', async () => {
      vi.mocked(writeFile).mockRejectedValue(new Error('Write failed'));

      await expect(configManager.saveConfig(mockConfig)).rejects.toThrow('Write failed');
    });
  });

  describe('addProject', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));
      vi.mocked(writeFile).mockResolvedValue();
      vi.mocked(mkdirSync).mockReturnValue(undefined);
    });

    it('should add new project', async () => {
      const saveConfigSpy = vi.spyOn(configManager, 'saveConfig').mockResolvedValue();
      // Reset mocks to ensure clean state
      vi.mocked(existsSync).mockReset();
      vi.mocked(existsSync)
        .mockReturnValueOnce(true)  // Config file exists during loadConfig
        .mockReturnValueOnce(false); // Project directory doesn't exist
      
      await configManager.addProject('testProject', '/path/to/test', 'Test project');

      expect(saveConfigSpy).toHaveBeenCalled();
      expect(mkdirSync).toHaveBeenCalledWith('/path/to/test', { recursive: true });
    });

    it('should throw error when project already exists', async () => {
      await expect(
        configManager.addProject('default', '/new/path', 'New description')
      ).rejects.toThrow("プロジェクト 'default' は既に存在します");
    });

    it('should use default description when not provided', async () => {
      await configManager.addProject('newProject', '/path/to/new');

      expect(writeFile).toHaveBeenCalled();
    });
  });

  describe('setDefaultProject', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));
      vi.mocked(writeFile).mockResolvedValue();
    });

    it('should set default project', async () => {
      await configManager.setDefaultProject('default');

      expect(writeFile).toHaveBeenCalled();
    });

    it('should throw error when project does not exist', async () => {
      await expect(
        configManager.setDefaultProject('nonexistent')
      ).rejects.toThrow("プロジェクト 'nonexistent' が見つかりません");
    });
  });

  describe('getProject', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));
    });

    it('should return default project when no name specified', async () => {
      const project = await configManager.getProject();

      expect(project).toEqual(mockConfig.projects.default);
    });

    it('should return specified project', async () => {
      const project = await configManager.getProject('default');

      expect(project).toEqual(mockConfig.projects.default);
    });

    it('should throw error when project does not exist', async () => {
      await expect(
        configManager.getProject('nonexistent')
      ).rejects.toThrow("プロジェクト 'nonexistent' が見つかりません");
    });
  });

  describe('listProjects', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));
    });

    it('should return all projects', async () => {
      const projects = await configManager.listProjects();

      expect(projects).toEqual(mockConfig.projects);
    });
  });
});