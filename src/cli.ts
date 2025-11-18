#!/usr/bin/env node

/**
 * Insurance Risk Simulator CLI
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadRulesFromFile, describeRuleSet } from './engine/ruleLoader';
import { calculateRisk } from './engine/riskCalculator';
import { normalizeScenario, CareHomeScenario } from './models/scenario';
import { formatResult } from './models/result';

const program = new Command();

program
  .name('risk-sim')
  .description('介護・医療施設向けリスクシミュレータ')
  .version('1.0.0');

program
  .command('run')
  .description('リスク評価を実行')
  .requiredOption('-r, --rules <path>', 'ルールファイル(YAML)のパス')
  .requiredOption('-i, --input <path>', '入力シナリオ(JSON)のパス')
  .option('-o, --output <path>', '出力ファイルのパス（指定しない場合は標準出力）')
  .option('-v, --verbose', '詳細情報を表示')
  .action((options) => {
    try {
      // ルールを読み込む
      if (options.verbose) {
        console.log(`Loading rules from: ${options.rules}`);
      }
      const ruleSet = loadRulesFromFile(options.rules);

      if (options.verbose) {
        console.log(describeRuleSet(ruleSet));
        console.log('');
      }

      // シナリオを読み込む
      if (options.verbose) {
        console.log(`Loading scenario from: ${options.input}`);
      }
      const scenarioContent = fs.readFileSync(options.input, 'utf8');
      const scenario: CareHomeScenario = JSON.parse(scenarioContent);

      // シナリオを正規化
      const normalizedScenario = normalizeScenario(scenario);

      if (options.verbose) {
        console.log('Scenario normalized:');
        console.log(`  - Average care level: ${normalizedScenario.computed.averageCareLevel.toFixed(2)}`);
        console.log(`  - Occupancy rate: ${normalizedScenario.computed.occupancyRate.toFixed(1)}%`);
        console.log(`  - Severe rate: ${normalizedScenario.computed.severeRate.toFixed(1)}%`);
        console.log(`  - Dementia rate: ${normalizedScenario.computed.dementiaRate.toFixed(1)}%`);
        console.log('');
      }

      // リスク計算を実行
      if (options.verbose) {
        console.log('Calculating risk...');
      }
      const result = calculateRisk(normalizedScenario, ruleSet);

      if (options.verbose) {
        console.log(`Total Score: ${result.totalScore}`);
        console.log(`Risk Rank: ${result.rank}`);
        console.log('');
      }

      // 結果を出力
      const output = formatResult(result);

      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf8');
        console.log(`Result saved to: ${options.output}`);
      } else {
        console.log(output);
      }

      // 簡易サマリー表示
      if (options.verbose) {
        console.log('\n=== SUMMARY ===');
        console.log(`Risk Rank: ${result.rank}`);
        console.log(`Total Score: ${result.totalScore}`);
        console.log(`\nRecommended Plans (${result.recommendedPlans.length}):`);
        result.recommendedPlans.forEach((plan, idx) => {
          console.log(`  ${idx + 1}. ${plan.name} - ${plan.reason}`);
        });
        console.log(`\nMajor Risks:`);
        result.summary.majorRisks.forEach((risk, idx) => {
          console.log(`  ${idx + 1}. ${risk}`);
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        if (options.verbose && error.stack) {
          console.error(error.stack);
        }
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('ルールファイルの検証')
  .requiredOption('-r, --rules <path>', 'ルールファイル(YAML)のパス')
  .action((options) => {
    try {
      const ruleSet = loadRulesFromFile(options.rules);
      console.log('✓ Rule file is valid');
      console.log(describeRuleSet(ruleSet));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`✗ Validation failed: ${error.message}`);
      } else {
        console.error('✗ Validation failed');
      }
      process.exit(1);
    }
  });

program.parse();
