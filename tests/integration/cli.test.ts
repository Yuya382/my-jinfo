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
    originalEnv = process.env;
    testDir = join(tmpdir(), `jinfo-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    
    // Mock HOME directory for testing
    process.env.HOME = testDir;
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

  describe('Basic CLI operations', () => {
    it('should show help when --help flag is used', async () => {
      const result = await runCLI(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('シンプルなCLIメモツール');
      expect(result.stdout).toContain('Usage:');
    });

    it('should show version when --version flag is used', async () => {
      const result = await runCLI(['--version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('1.0.0');
    });

    it('should create initial config on first run', async () => {
      const result = await runCLI(['Test memo']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('初期設定を作成しました');
      expect(result.stdout).toContain('メモを追加しました');

      const configPath = join(testDir, '.jinfo', 'config.json');
      expect(existsSync(configPath)).toBe(true);
    });
  });

  describe('Memo operations', () => {
    beforeEach(async () => {
      // Initialize config
      await runCLI(['Initial setup memo']);
    });

    it('should add memo successfully', async () => {
      const result = await runCLI(['Hello World #test']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('メモを追加しました: Hello World #test');
    });

    it('should list memos', async () => {
      await runCLI(['First memo #test']);
      await runCLI(['Second memo #important']);

      const result = await runCLI(['list']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('First memo #test');
      expect(result.stdout).toContain('Second memo #important');
    });

    it('should search memos by content', async () => {
      await runCLI(['Meeting notes #meeting']);
      await runCLI(['Project update #project']);

      const result = await runCLI(['search', 'meeting']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Meeting notes #meeting');
      expect(result.stdout).not.toContain('Project update #project');
    });

    it('should search memos by tag', async () => {
      await runCLI(['Meeting notes #meeting']);
      await runCLI(['Another meeting #meeting']);
      await runCLI(['Project update #project']);

      const result = await runCLI(['search', '--tag', 'meeting', 'notes']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Meeting notes #meeting');
      expect(result.stdout).not.toContain('Another meeting #meeting');
    });

    it('should handle Japanese content', async () => {
      const result = await runCLI(['会議のメモ #重要']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('メモを追加しました: 会議のメモ #重要');
    });

    it('should show info when no memos found', async () => {
      const result = await runCLI(['search', 'nonexistent']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('検索結果が見つかりませんでした');
    });
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
    });

    it('should add new project', async () => {
      const projectPath = join(testDir, 'test-project');
      const result = await runCLI(['project', 'add', 'testproj', projectPath, '--description', 'Test project']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("プロジェクト 'testproj' を追加しました");
    });

    it('should set default project', async () => {
      const projectPath = join(testDir, 'test-project');
      await runCLI(['project', 'add', 'testproj', projectPath]);

      const result = await runCLI(['project', 'default', 'testproj']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("デフォルトプロジェクトを 'testproj' に設定しました");
    });

    it('should use specified project for memo', async () => {
      const projectPath = join(testDir, 'test-project');
      await runCLI(['project', 'add', 'testproj', projectPath]);

      const result = await runCLI(['--project', 'testproj', 'Project specific memo']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('メモを追加しました: Project specific memo');
    });

    it('should handle project errors gracefully', async () => {
      const result = await runCLI(['project', 'default', 'nonexistent']);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("プロジェクト 'nonexistent' が見つかりません");
    });
  });

  describe('Error handling', () => {
    it('should handle invalid commands gracefully', async () => {
      const result = await runCLI(['invalid-command']);

      expect(result.exitCode).toBe(0); // Commander treats unknown args as memo content
      expect(result.stdout).toContain('メモを追加しました: invalid-command');
    });

    it('should handle missing search query', async () => {
      await runCLI(['Initial setup memo']);
      const result = await runCLI(['search']);

      expect(result.exitCode).toBe(1);
    });
  });

  describe('File system integration', () => {
    beforeEach(async () => {
      await runCLI(['Initial setup memo']);
    });

    it('should create proper file structure', async () => {
      await runCLI(['Test memo']);

      const configPath = join(testDir, '.jinfo', 'config.json');
      const defaultProjectPath = join(testDir, 'Documents', 'jinfo', 'default');

      expect(existsSync(configPath)).toBe(true);
      expect(existsSync(defaultProjectPath)).toBe(true);

      const files = require('fs').readdirSync(defaultProjectPath);
      const todayFile = files.find((file: string) => file.endsWith('.md'));
      expect(todayFile).toBeDefined();
    });

    it('should persist memos across CLI invocations', async () => {
      await runCLI(['First memo']);
      await runCLI(['Second memo']);

      const result = await runCLI(['list']);

      expect(result.stdout).toContain('First memo');
      expect(result.stdout).toContain('Second memo');
    });

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
    });
  });
});