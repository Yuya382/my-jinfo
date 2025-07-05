import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('CLI Integration Tests', () => {
  let testDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    testDir = join(tmpdir(), `jinfo-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    
    // Mock HOME directory for testing
    process.env.HOME = testDir;
    process.env.JINFO_CONFIG_DIR = join(testDir, '.jinfo');
  });

  afterEach(() => {
    process.env = originalEnv;
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  const runCLI = (args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
    return new Promise((resolve) => {
      const child = spawn('node', ['./bin/jinfo.js', ...args], {
        cwd: process.cwd(),
        env: { ...process.env, HOME: testDir }
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code || 0 });
      });
    });
  };

  const waitForFile = (filePath: string, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (existsSync(filePath)) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error(`File not found: ${filePath}`));
        }
      }, 100);
    });
  };

  describe('Basic CLI operations', () => {
    it('should show help when --help flag is used', async () => {
      const result = await runCLI(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('シンプルなCLIメモツール');
      expect(result.stdout).toContain('Usage:');
    }, 15000);

    it('should show version when --version flag is used', async () => {
      const result = await runCLI(['--version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('1.0.0');
    }, 15000);

    it('should create initial config on first run', async () => {
      const result = await runCLI(['Test memo']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('メモを追加しました: Test memo');

      const configPath = join(testDir, '.jinfo', 'config.json');
      await waitForFile(configPath);
      expect(existsSync(configPath)).toBe(true);

      const config = JSON.parse(await readFile(configPath, 'utf-8'));
      expect(config.projects[0].name).toBe('default');
    }, 15000);

    it('should add new project', async () => {
      const projectPath = join(testDir, 'test-project');
      const result = await runCLI(['project', 'add', 'testproj', '--path', projectPath, '--description', 'Test project']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("プロジェクト 'testproj' を追加しました");
    }, 15000);

    it('should set default project', async () => {
      const projectPath = join(testDir, 'test-project');
      await runCLI(['project', 'add', 'testproj', projectPath]);

      const result = await runCLI(['project', 'default', 'testproj']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("デフォルトプロジェクトを 'testproj' に設定しました");
    }, 15000);

    it('should use specified project for memo', async () => {
      const projectPath = join(testDir, 'test-project');
      await runCLI(['project', 'add', 'testproj', projectPath]);

      const result = await runCLI(['--project', 'testproj', 'Project specific memo']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('メモを追加しました: Project specific memo');
    }, 15000);

    it('should handle project errors gracefully', async () => {
      const result = await runCLI(['project', 'default', 'nonexistent']);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("が見つかりません");
    }, 15000);

    it('should handle missing search query', async () => {
      await runCLI(['Initial setup memo']);
      const result = await runCLI(['search']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("error: missing required argument 'query'");
    }, 15000);

    it('should create proper file structure', async () => {
      await runCLI(['Test memo']);

      const configPath = join(testDir, '.jinfo', 'config.json');
      const memoDir = join(testDir, '.jinfo', 'memos', 'default');

      await waitForFile(configPath);
      await waitForFile(memoDir);

      expect(existsSync(configPath)).toBe(true);
      expect(existsSync(memoDir)).toBe(true);

      const files = require('fs').readdirSync(memoDir);
      const todayFile = files.find((file: string) => file.endsWith('.md'));
      expect(todayFile).toBeDefined();
    }, 15000);
  });

  describe('Memo operations', () => {
    beforeEach(async () => {
      // Initialize config
      const result = await runCLI(['Initial setup memo']);
      expect(result.exitCode).toBe(0);
    });

    it('should add memo successfully', async () => {
      const result = await runCLI(['Hello World #test']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('メモを追加しました: Hello World #test');
    }, 15000);

    it('should list memos', async () => {
      await runCLI(['First memo #test']);
      await runCLI(['Second memo #important']);

      const result = await runCLI(['list']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('First memo #test');
      expect(result.stdout).toContain('Second memo #important');
    }, 15000);

    it('should search memos by content', async () => {
      await runCLI(['Meeting notes #meeting']);
      await runCLI(['Project update #project']);

      const result = await runCLI(['search', 'meeting']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Meeting notes #meeting');
      expect(result.stdout).not.toContain('Project update #project');
    }, 15000);

    it('should search memos by tag', async () => {
      await runCLI(['Meeting notes #meeting']);
      await runCLI(['Another meeting #meeting']);
      await runCLI(['Project update #project']);

      const result = await runCLI(['search', '--tag', 'meeting', 'notes']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Meeting notes #meeting');
      expect(result.stdout).not.toContain('Another meeting #meeting');
    }, 15000);

    it('should handle Japanese content', async () => {
      const result = await runCLI(['会議のメモ #重要']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('メモを追加しました: 会議のメモ #重要');
    }, 15000);

    it('should show info when no memos found', async () => {
      const result = await runCLI(['search', 'nonexistent']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('検索結果が見つかりませんでした');
    }, 15000);
  });

  describe('Project management', () => {
    beforeEach(async () => {
      // Initialize config
      await runCLI(['Initial setup memo']);
    });

    it('should list projects', async () => {
      const result = await runCLI(['project', 'list']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('プロジェクト一覧');
      expect(result.stdout).toContain('default');
      expect(result.stdout).toContain('デフォルト');
    }, 15000);

    it('should handle project errors gracefully', async () => {
      const result = await runCLI(['project', 'default', 'nonexistent']);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("が見つかりません");
    }, 15000);

    it('should handle missing search query', async () => {
      await runCLI(['Initial setup memo']);
      const result = await runCLI(['search']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("error: missing required argument 'query'");
    }, 15000);
  });

  describe('Error handling', () => {
    it('should handle invalid commands gracefully', async () => {
      const result = await runCLI(['invalid-command']);

      expect(result.exitCode).toBe(0); // Commander treats unknown args as memo content
      expect(result.stdout).toContain('メモを追加しました: invalid-command');
    }, 15000);
  });

  describe('File system integration', () => {
    beforeEach(async () => {
      await runCLI(['Initial setup memo']);
    });

    it('should persist memos across CLI invocations', async () => {
      await runCLI(['First memo']);
      await runCLI(['Second memo']);

      const result = await runCLI(['list']);

      expect(result.stdout).toContain('First memo');
      expect(result.stdout).toContain('Second memo');
    }, 15000);

    it('should handle concurrent access safely', async () => {
      const promises = [
        runCLI(['Memo 1']),
        runCLI(['Memo 2']),
        runCLI(['Memo 3'])
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('メモを追加しました');
      });

      const listResult = await runCLI(['list']);
      expect(listResult.stdout).toContain('Memo 1');
      expect(listResult.stdout).toContain('Memo 2');
      expect(listResult.stdout).toContain('Memo 3');
    }, 25000);
  });
});