import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type { Config, ProjectConfig } from './types.js';
import { logger } from '../utils/logger.js';

const CONFIG_DIR = join(homedir(), '.jinfo');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Config = {
  version: '1.0.0',
  defaultProject: 'default',
  projects: {
    default: {
      path: join(homedir(), 'Documents', 'jinfo', 'default'),
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

export class ConfigManager {
  private config: Config | null = null;

  async loadConfig(): Promise<Config> {
    if (this.config) {
      return this.config;
    }

    try {
      if (!existsSync(CONFIG_FILE)) {
        await this.createDefaultConfig();
      }

      const configData = await readFile(CONFIG_FILE, 'utf-8');
      this.config = JSON.parse(configData);
      return this.config!;
    } catch (error) {
      logger.error(`設定ファイルの読み込みに失敗しました: ${error}`);
      throw error;
    }
  }

  async saveConfig(config: Config): Promise<void> {
    try {
      await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
      this.config = config;
      logger.success('設定を保存しました');
    } catch (error) {
      logger.error(`設定の保存に失敗しました: ${error}`);
      throw error;
    }
  }

  async createDefaultConfig(): Promise<void> {
    try {
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
      }

      await this.saveConfig(DEFAULT_CONFIG);

      for (const projectName in DEFAULT_CONFIG.projects) {
        const project = DEFAULT_CONFIG.projects[projectName];
        if (!existsSync(project.path)) {
          mkdirSync(project.path, { recursive: true });
        }
      }

      logger.info('初期設定を作成しました');
    } catch (error) {
      logger.error(`初期設定の作成に失敗しました: ${error}`);
      throw error;
    }
  }

  async addProject(name: string, path: string, description?: string): Promise<void> {
    const config = await this.loadConfig();
    
    if (config.projects[name]) {
      throw new Error(`プロジェクト '${name}' は既に存在します`);
    }

    config.projects[name] = {
      path,
      description: description || `${name}プロジェクト`
    };

    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }

    await this.saveConfig(config);
    logger.success(`プロジェクト '${name}' を追加しました`);
  }

  async setDefaultProject(name: string): Promise<void> {
    const config = await this.loadConfig();
    
    if (!config.projects[name]) {
      throw new Error(`プロジェクト '${name}' が見つかりません`);
    }

    config.defaultProject = name;
    await this.saveConfig(config);
    logger.success(`デフォルトプロジェクトを '${name}' に設定しました`);
  }

  async getProject(name?: string): Promise<ProjectConfig> {
    const config = await this.loadConfig();
    const projectName = name || config.defaultProject;
    
    if (!config.projects[projectName]) {
      throw new Error(`プロジェクト '${projectName}' が見つかりません`);
    }

    return config.projects[projectName];
  }

  async listProjects(): Promise<Record<string, ProjectConfig>> {
    const config = await this.loadConfig();
    return config.projects;
  }
}