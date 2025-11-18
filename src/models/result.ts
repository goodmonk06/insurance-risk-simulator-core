/**
 * リスク評価結果の型定義
 */

/**
 * リスクランク
 */
export type RiskRank = 'A' | 'B' | 'C' | 'D' | 'E';

/**
 * リスクファクター（個別評価項目）
 */
export interface RiskFactor {
  /** ファクター名 */
  name: string;
  /** カテゴリ */
  category: string;
  /** スコア */
  score: number;
  /** 係数（重み） */
  weight: number;
  /** 加重スコア */
  weightedScore: number;
  /** 説明 */
  description?: string;
}

/**
 * 推奨保険プラン
 */
export interface InsurancePlan {
  /** プランID */
  id: string;
  /** プラン名 */
  name: string;
  /** 説明 */
  description: string;
  /** 推奨理由 */
  reason: string;
  /** 優先度 (1が最優先) */
  priority: number;
}

/**
 * リスク評価結果
 */
export interface RiskAssessmentResult {
  /** 総合リスクスコア */
  totalScore: number;

  /** リスクランク */
  rank: RiskRank;

  /** リスクファクター詳細 */
  factors: RiskFactor[];

  /** カテゴリ別スコア */
  categoryScores: {
    [category: string]: {
      score: number;
      maxScore: number;
      percentage: number;
    };
  };

  /** 推奨保険プラン */
  recommendedPlans: InsurancePlan[];

  /** 評価サマリー */
  summary: {
    /** 主要リスク要因 */
    majorRisks: string[];
    /** 改善推奨事項 */
    improvements: string[];
    /** 総評 */
    overallAssessment: string;
  };

  /** メタデータ */
  metadata: {
    /** 評価日時 */
    evaluatedAt: string;
    /** ルールセット名 */
    ruleSetName: string;
    /** ルールバージョン */
    ruleVersion: string;
  };
}

/**
 * リスクランクを判定する
 */
export function determineRiskRank(score: number, thresholds: { A: number; B: number; C: number; D: number }): RiskRank {
  if (score <= thresholds.A) return 'A';
  if (score <= thresholds.B) return 'B';
  if (score <= thresholds.C) return 'C';
  if (score <= thresholds.D) return 'D';
  return 'E';
}

/**
 * 結果をJSON形式でフォーマット
 */
export function formatResult(result: RiskAssessmentResult): string {
  return JSON.stringify(result, null, 2);
}
