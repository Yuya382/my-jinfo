#!/usr/bin/env node

import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import { ConfigManager } from './config/manager.js';
import { MemoWriter } from './storage/writer.js';
import { MemoReader } from './storage/reader.js';
import { logger } from './utils/logger.js';

const program = new Command();
const configManager = new ConfigManager();

program
  .name('jinfo')
  .description('シンプルなCLIメモツール')
  .version('1.0.0');

program
  .argument('[memo]', 'メモ内容')
  .option('-p, --project <name>', 'プロジェクト名を指定')
  .action(async (memo, options) => {
    try {
      const project = await configManager.getProject(options.project);
      const writer = new MemoWriter(project.path);
      
      let memoContent = memo;
      if (!memoContent) {
        memoContent = await input({
          message: 'Please add memo:',
          required: true
        });
      }
      
      await writer.addMemo(memoContent);
    } catch (error) {
      logger.error(`エラーが発生しました: ${error}`);
      process.exit(1);
    }
  });

const listCommand = program
  .command('list')
  .description('メモの一覧表示');

listCommand
  .option('-d, --date <date>', '特定日のメモ (YYYY-MM-DD)')
  .option('-r, --recent <days>', '最近のメモ（日数指定）', '7')
  .option('-p, --project <name>', 'プロジェクト名を指定')
  .action(async (options) => {
    try {
      const project = await configManager.getProject(options.project);
      const reader = new MemoReader(project.path);
      
      let memos;
      if (options.date) {
        memos = await reader.readMemos(options.date);
      } else {
        memos = await reader.readRecentMemos(parseInt(options.recent));
      }
      
      if (memos.length === 0) {
        logger.info('メモが見つかりませんでした');
        return;
      }
      
      memos.forEach(memo => {
        console.log(`[${memo.timestamp}] ${memo.content}`);
      });
    } catch (error) {
      logger.error(`エラーが発生しました: ${error}`);
      process.exit(1);
    }
  });

const searchCommand = program
  .command('search <query>')
  .description('メモの検索');

searchCommand
  .option('-t, --tag <tag>', 'タグで検索')
  .option('-f, --from <date>', '開始日 (YYYY-MM-DD)')
  .option('--to <date>', '終了日 (YYYY-MM-DD)')
  .option('-p, --project <name>', 'プロジェクト名を指定')
  .action(async (query, options) => {
    try {
      const project = await configManager.getProject(options.project);
      const reader = new MemoReader(project.path);
      
      const memos = await reader.searchMemos(query, {
        tag: options.tag,
        fromDate: options.from,
        toDate: options.to
      });
      
      if (memos.length === 0) {
        logger.info('検索結果が見つかりませんでした');
        return;
      }
      
      memos.forEach(memo => {
        console.log(`[${memo.timestamp}] ${memo.content}`);
      });
    } catch (error) {
      logger.error(`エラーが発生しました: ${error}`);
      process.exit(1);
    }
  });

const projectCommand = program
  .command('project')
  .description('プロジェクト管理');

projectCommand
  .command('list')
  .description('プロジェクト一覧')
  .action(async () => {
    try {
      const projects = await configManager.listProjects();
      const config = await configManager.loadConfig();
      
      console.log('プロジェクト一覧:');
      Object.entries(projects).forEach(([name, project]) => {
        const isDefault = name === config.defaultProject ? ' (デフォルト)' : '';
        console.log(`  ${name}${isDefault}: ${project.description}`);
        console.log(`    パス: ${project.path}`);
      });
    } catch (error) {
      logger.error(`エラーが発生しました: ${error}`);
      process.exit(1);
    }
  });

projectCommand
  .command('add <name> <path>')
  .description('プロジェクト追加')
  .option('-d, --description <desc>', 'プロジェクトの説明')
  .action(async (name, path, options) => {
    try {
      await configManager.addProject(name, path, options.description);
    } catch (error) {
      logger.error(`エラーが発生しました: ${error}`);
      process.exit(1);
    }
  });

projectCommand
  .command('default <name>')
  .description('デフォルトプロジェクト設定')
  .action(async (name) => {
    try {
      await configManager.setDefaultProject(name);
    } catch (error) {
      logger.error(`エラーが発生しました: ${error}`);
      process.exit(1);
    }
  });

// 対話式メモ追加コマンド
program
  .command('interactive')
  .alias('i')
  .description('対話式でメモを追加')
  .action(async () => {
    try {
      // プロジェクト選択
      const projects = await configManager.listProjects();
      const config = await configManager.loadConfig();
      
      const projectChoices = Object.entries(projects).map(([name, project]) => ({
        name: `${name} - ${project.description}`,
        value: name,
        description: project.path
      }));
      
      const selectedProject = await select({
        message: 'プロジェクトを選択してください:',
        choices: projectChoices,
        default: config.defaultProject
      });
      
      // メモ内容入力
      const memoContent = await input({
        message: 'メモ内容を入力してください:',
        required: true,
        validate: (value) => {
          if (value.trim().length === 0) {
            return 'メモ内容は必須です';
          }
          return true;
        }
      });
      
      // メモ保存
      const project = await configManager.getProject(selectedProject);
      const writer = new MemoWriter(project.path);
      await writer.addMemo(memoContent);
      
      logger.success(`メモを追加しました (プロジェクト: ${selectedProject})`);
      
    } catch (error) {
      logger.error(`エラーが発生しました: ${error}`);
      process.exit(1);
    }
  });

async function main() {
  try {
    await configManager.loadConfig();
    await program.parseAsync();
  } catch (error) {
    logger.error(`初期化エラー: ${error}`);
    process.exit(1);
  }
}

main();