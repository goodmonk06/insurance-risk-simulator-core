/**
 * 入力シナリオの型定義
 */

export interface CareHomeScenario {
  /** 施設情報 */
  facility: {
    /** 施設名 */
    name: string;
    /** 施設タイプ (特養、有料、グループホームなど) */
    type: string;
    /** 総定員数 */
    capacity: number;
  };

  /** 入居者情報 */
  residents: {
    /** 総入居者数 */
    total: number;
    /** 平均年齢 */
    averageAge: number;
    /** 要介護度分布 */
    careLevel: {
      level1: number;
      level2: number;
      level3: number;
      level4: number;
      level5: number;
    };
    /** 認知症患者数 */
    dementia: number;
    /** 医療的ケアが必要な人数 */
    medicalCare: number;
  };

  /** 人員配置 */
  staffing: {
    /** 介護職員数（常勤換算） */
    careWorkers: number;
    /** 看護職員数（常勤換算） */
    nurses: number;
    /** 入居者：介護職員比率 */
    residentToStaffRatio: number;
    /** 夜勤体制人数 */
    nightShiftStaff: number;
  };

  /** 施設設備 */
  facilities: {
    /** スプリンクラー設置 */
    sprinkler: boolean;
    /** 自動火災報知設備 */
    fireAlarm: boolean;
    /** バリアフリー対応 */
    barrierFree: boolean;
    /** 医療機器（AED等） */
    medicalEquipment: string[];
  };

  /** 過去の事故・インシデント */
  incidents?: {
    /** 過去1年間の転倒事故件数 */
    falls?: number;
    /** 過去1年間の誤嚥事故件数 */
    aspiration?: number;
    /** 過去1年間の感染症発生件数 */
    infection?: number;
    /** 過去1年間の離設（無断外出）件数 */
    wandering?: number;
  };
}

/**
 * 正規化されたシナリオ（計算用）
 */
export interface NormalizedScenario extends CareHomeScenario {
  /** 計算用の追加プロパティ */
  computed: {
    /** 平均要介護度 */
    averageCareLevel: number;
    /** 稼働率（入居率） */
    occupancyRate: number;
    /** 重度者（要介護4-5）比率 */
    severeRate: number;
    /** 認知症比率 */
    dementiaRate: number;
  };
}

/**
 * シナリオを正規化する
 */
export function normalizeScenario(scenario: CareHomeScenario): NormalizedScenario {
  const { residents, facility } = scenario;

  // 平均要介護度を計算
  const totalCareLevels =
    residents.careLevel.level1 * 1 +
    residents.careLevel.level2 * 2 +
    residents.careLevel.level3 * 3 +
    residents.careLevel.level4 * 4 +
    residents.careLevel.level5 * 5;
  const averageCareLevel = residents.total > 0
    ? totalCareLevels / residents.total
    : 0;

  // 稼働率
  const occupancyRate = facility.capacity > 0
    ? (residents.total / facility.capacity) * 100
    : 0;

  // 重度者比率
  const severeCount = residents.careLevel.level4 + residents.careLevel.level5;
  const severeRate = residents.total > 0
    ? (severeCount / residents.total) * 100
    : 0;

  // 認知症比率
  const dementiaRate = residents.total > 0
    ? (residents.dementia / residents.total) * 100
    : 0;

  return {
    ...scenario,
    computed: {
      averageCareLevel,
      occupancyRate,
      severeRate,
      dementiaRate,
    },
  };
}
