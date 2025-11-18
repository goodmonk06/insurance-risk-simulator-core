/**
 * ルールローダー - YAMLファイルからルールを読み込む
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';

/**
 * 条件式の型
 */
export interface Condition {
  /** 対象フィールド */
  field: string;
  /** 演算子 (eq, gt, gte, lt, lte, in, between) */
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
  /** 比較値 */
  value: any;
}

/**
 * リスクルール
 */
export interface RiskRule {
  /** ルール名 */
  name: string;
  /** カテゴリ */
  category: string;
  /** 説明 */
  description?: string;
  /** 条件リスト (AND条件) */
  conditions: Condition[];
  /** スコア */
  score: number;
  /** 係数（重み） */
  weight: number;
}

/**
 * 保険プランルール
 */
export interface PlanRule {
  /** プランID */
  id: string;
  /** プラン名 */
  name: string;
  /** 説明 */
  description: string;
  /** 適用条件 */
  conditions: {
    /** 最小リスクスコア */
    minScore?: number;
    /** 最大リスクスコア */
    maxScore?: number;
    /** リスクランク */
    ranks?: string[];
    /** カスタム条件 */
    custom?: Condition[];
  };
  /** 優先度 */
  priority: number;
  /** 推奨理由テンプレート */
  reasonTemplate: string;
}

/**
 * ルールセット
 */
export interface RuleSet {
  /** ルールセット名 */
  name: string;
  /** バージョン */
  version: string;
  /** 説明 */
  description?: string;
  /** リスクランク閾値 */
  rankThresholds: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  /** リスクルール */
  riskRules: RiskRule[];
  /** 保険プランルール */
  planRules: PlanRule[];
  /** 改善推奨ルール */
  improvementRules?: {
    condition: Condition[];
    message: string;
  }[];
}

/**
 * YAMLファイルからルールを読み込む
 */
export function loadRulesFromFile(filePath: string): RuleSet {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const ruleSet = yaml.load(fileContent) as RuleSet;

    // バリデーション
    validateRuleSet(ruleSet);

    return ruleSet;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load rules from ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * ルールセットのバリデーション
 */
function validateRuleSet(ruleSet: RuleSet): void {
  if (!ruleSet.name || !ruleSet.version) {
    throw new Error('RuleSet must have name and version');
  }

  if (!ruleSet.rankThresholds) {
    throw new Error('RuleSet must have rankThresholds');
  }

  if (!Array.isArray(ruleSet.riskRules) || ruleSet.riskRules.length === 0) {
    throw new Error('RuleSet must have at least one risk rule');
  }

  if (!Array.isArray(ruleSet.planRules)) {
    throw new Error('RuleSet must have planRules array');
  }

  // 各ルールのバリデーション
  for (const rule of ruleSet.riskRules) {
    if (!rule.name || !rule.category) {
      throw new Error(`Risk rule must have name and category: ${JSON.stringify(rule)}`);
    }
    if (!Array.isArray(rule.conditions)) {
      throw new Error(`Risk rule ${rule.name} must have conditions array`);
    }
    if (typeof rule.score !== 'number' || typeof rule.weight !== 'number') {
      throw new Error(`Risk rule ${rule.name} must have numeric score and weight`);
    }
  }
}

/**
 * ルールセットから文字列表現を生成（デバッグ用）
 */
export function describeRuleSet(ruleSet: RuleSet): string {
  const lines: string[] = [];
  lines.push(`RuleSet: ${ruleSet.name} (v${ruleSet.version})`);
  lines.push(`  Risk Rules: ${ruleSet.riskRules.length}`);
  lines.push(`  Plan Rules: ${ruleSet.planRules.length}`);
  lines.push(`  Rank Thresholds: A=${ruleSet.rankThresholds.A}, B=${ruleSet.rankThresholds.B}, C=${ruleSet.rankThresholds.C}, D=${ruleSet.rankThresholds.D}`);
  return lines.join('\n');
}
