/**
 * リスク計算エンジン
 */

import { NormalizedScenario } from '../models/scenario';
import { RiskAssessmentResult, RiskFactor, InsurancePlan, determineRiskRank } from '../models/result';
import { RuleSet, RiskRule, Condition, PlanRule } from './ruleLoader';

/**
 * リスク評価を実行
 */
export function calculateRisk(
  scenario: NormalizedScenario,
  ruleSet: RuleSet
): RiskAssessmentResult {
  // 1. 各リスクルールを評価してファクターを収集
  const factors: RiskFactor[] = [];
  for (const rule of ruleSet.riskRules) {
    if (evaluateConditions(rule.conditions, scenario)) {
      factors.push({
        name: rule.name,
        category: rule.category,
        score: rule.score,
        weight: rule.weight,
        weightedScore: rule.score * rule.weight,
        description: rule.description,
      });
    }
  }

  // 2. 総合スコアを計算
  const totalScore = factors.reduce((sum, factor) => sum + factor.weightedScore, 0);

  // 3. リスクランクを判定
  const rank = determineRiskRank(totalScore, ruleSet.rankThresholds);

  // 4. カテゴリ別スコアを集計
  const categoryScores = calculateCategoryScores(factors, ruleSet);

  // 5. 推奨プランを選定
  const recommendedPlans = selectRecommendedPlans(totalScore, rank, scenario, ruleSet.planRules);

  // 6. サマリーを生成
  const summary = generateSummary(factors, rank, ruleSet);

  // 7. 結果を返す
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    rank,
    factors,
    categoryScores,
    recommendedPlans,
    summary,
    metadata: {
      evaluatedAt: new Date().toISOString(),
      ruleSetName: ruleSet.name,
      ruleVersion: ruleSet.version,
    },
  };
}

/**
 * 条件リストを評価（AND条件）
 */
function evaluateConditions(conditions: Condition[], scenario: NormalizedScenario): boolean {
  for (const condition of conditions) {
    if (!evaluateCondition(condition, scenario)) {
      return false;
    }
  }
  return true;
}

/**
 * 単一条件を評価
 */
function evaluateCondition(condition: Condition, scenario: any): boolean {
  const fieldValue = getFieldValue(condition.field, scenario);

  switch (condition.operator) {
    case 'eq':
      return fieldValue === condition.value;
    case 'gt':
      return fieldValue > condition.value;
    case 'gte':
      return fieldValue >= condition.value;
    case 'lt':
      return fieldValue < condition.value;
    case 'lte':
      return fieldValue <= condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case 'between':
      return (
        Array.isArray(condition.value) &&
        condition.value.length === 2 &&
        fieldValue >= condition.value[0] &&
        fieldValue <= condition.value[1]
      );
    default:
      return false;
  }
}

/**
 * フィールド値を取得（ドット記法対応）
 */
function getFieldValue(field: string, obj: any): any {
  const keys = field.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

/**
 * カテゴリ別スコアを計算
 */
function calculateCategoryScores(
  factors: RiskFactor[],
  ruleSet: RuleSet
): { [category: string]: { score: number; maxScore: number; percentage: number } } {
  const categoryScores: { [category: string]: { score: number; maxScore: number } } = {};

  // 実際のスコアを集計
  for (const factor of factors) {
    if (!categoryScores[factor.category]) {
      categoryScores[factor.category] = { score: 0, maxScore: 0 };
    }
    categoryScores[factor.category].score += factor.weightedScore;
  }

  // 各カテゴリの最大スコアを計算
  for (const rule of ruleSet.riskRules) {
    if (!categoryScores[rule.category]) {
      categoryScores[rule.category] = { score: 0, maxScore: 0 };
    }
    categoryScores[rule.category].maxScore += rule.score * rule.weight;
  }

  // パーセンテージを追加
  const result: { [category: string]: { score: number; maxScore: number; percentage: number } } = {};
  for (const [category, scores] of Object.entries(categoryScores)) {
    result[category] = {
      score: Math.round(scores.score * 100) / 100,
      maxScore: Math.round(scores.maxScore * 100) / 100,
      percentage: scores.maxScore > 0
        ? Math.round((scores.score / scores.maxScore) * 10000) / 100
        : 0,
    };
  }

  return result;
}

/**
 * 推奨プランを選定
 */
function selectRecommendedPlans(
  totalScore: number,
  rank: string,
  scenario: NormalizedScenario,
  planRules: PlanRule[]
): InsurancePlan[] {
  const plans: InsurancePlan[] = [];

  for (const planRule of planRules) {
    const { conditions } = planRule;

    // スコア範囲チェック
    if (conditions.minScore !== undefined && totalScore < conditions.minScore) {
      continue;
    }
    if (conditions.maxScore !== undefined && totalScore > conditions.maxScore) {
      continue;
    }

    // ランクチェック
    if (conditions.ranks && !conditions.ranks.includes(rank)) {
      continue;
    }

    // カスタム条件チェック
    if (conditions.custom && !evaluateConditions(conditions.custom, scenario)) {
      continue;
    }

    // 条件を満たしたプランを追加
    plans.push({
      id: planRule.id,
      name: planRule.name,
      description: planRule.description,
      reason: generatePlanReason(planRule, totalScore, rank),
      priority: planRule.priority,
    });
  }

  // 優先度順にソート
  plans.sort((a, b) => a.priority - b.priority);

  return plans;
}

/**
 * プラン推奨理由を生成
 */
function generatePlanReason(planRule: PlanRule, totalScore: number, rank: string): string {
  return planRule.reasonTemplate
    .replace('{{score}}', totalScore.toFixed(2))
    .replace('{{rank}}', rank);
}

/**
 * 評価サマリーを生成
 */
function generateSummary(
  factors: RiskFactor[],
  rank: string,
  ruleSet: RuleSet
): {
  majorRisks: string[];
  improvements: string[];
  overallAssessment: string;
} {
  // 主要リスク要因（スコアの高い上位3つ）
  const sortedFactors = [...factors].sort((a, b) => b.weightedScore - a.weightedScore);
  const majorRisks = sortedFactors.slice(0, 3).map(f => f.name);

  // 改善推奨事項（ルールセットから取得）
  const improvements: string[] = [];
  if (ruleSet.improvementRules) {
    // 簡易実装: 該当する改善ルールがあれば追加
    improvements.push('定期的な安全点検の実施');
    improvements.push('職員の研修・教育の充実');
  }

  // 総評
  let overallAssessment = '';
  switch (rank) {
    case 'A':
      overallAssessment = '非常に良好なリスク管理状態です。現状の取り組みを継続してください。';
      break;
    case 'B':
      overallAssessment = '良好なリスク管理状態です。一部改善の余地があります。';
      break;
    case 'C':
      overallAssessment = '標準的なリスク管理状態です。いくつかの改善が推奨されます。';
      break;
    case 'D':
      overallAssessment = 'リスク管理に課題があります。早急な改善が必要です。';
      break;
    case 'E':
      overallAssessment = '重大なリスク要因が存在します。至急、対策を講じてください。';
      break;
  }

  return {
    majorRisks,
    improvements,
    overallAssessment,
  };
}
