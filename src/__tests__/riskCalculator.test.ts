/**
 * Risk Calculator Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateRisk } from '../engine/riskCalculator';
import { normalizeScenario } from '../models/scenario';
import { RuleSet } from '../engine/ruleLoader';

describe('Risk Calculator', () => {
  const mockRuleSet: RuleSet = {
    name: 'test-rules',
    version: '1.0.0',
    rankThresholds: {
      A: 20,
      B: 40,
      C: 60,
      D: 80,
    },
    riskRules: [
      {
        name: 'High age risk',
        category: 'Residents',
        conditions: [
          {
            field: 'residents.averageAge',
            operator: 'gte',
            value: 85,
          },
        ],
        score: 10,
        weight: 1.0,
      },
      {
        name: 'Severe care level',
        category: 'Residents',
        conditions: [
          {
            field: 'computed.severeRate',
            operator: 'gte',
            value: 50,
          },
        ],
        score: 15,
        weight: 1.5,
      },
    ],
    planRules: [
      {
        id: 'basic-plan',
        name: 'Basic Plan',
        description: 'Basic coverage',
        priority: 1,
        conditions: {
          maxScore: 40,
        },
        reasonTemplate: 'Low risk scenario with score {{score}}',
      },
    ],
  };

  const mockScenario = {
    facility: {
      name: 'Test Facility',
      type: 'Nursing Home',
      capacity: 50,
    },
    residents: {
      total: 40,
      averageAge: 86,
      careLevel: {
        level1: 5,
        level2: 5,
        level3: 5,
        level4: 15,
        level5: 10,
      },
      dementia: 20,
      medicalCare: 10,
    },
    staffing: {
      careWorkers: 15,
      nurses: 3,
      residentToStaffRatio: 2.67,
      nightShiftStaff: 3,
    },
    facilities: {
      sprinkler: true,
      fireAlarm: true,
      barrierFree: true,
      medicalEquipment: ['AED'],
    },
  };

  it('should calculate risk score correctly', () => {
    const normalized = normalizeScenario(mockScenario);
    const result = calculateRisk(normalized, mockRuleSet);

    expect(result).toBeDefined();
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.rank).toBeDefined();
    expect(['A', 'B', 'C', 'D', 'E']).toContain(result.rank);
  });

  it('should detect high age risk factor', () => {
    const normalized = normalizeScenario(mockScenario);
    const result = calculateRisk(normalized, mockRuleSet);

    const ageRiskFactor = result.factors.find((f) => f.name === 'High age risk');
    expect(ageRiskFactor).toBeDefined();
    expect(ageRiskFactor?.score).toBe(10);
    expect(ageRiskFactor?.weight).toBe(1.0);
  });

  it('should detect severe care level risk', () => {
    const normalized = normalizeScenario(mockScenario);
    const result = calculateRisk(normalized, mockRuleSet);

    // Severe rate should be > 50% (25 out of 40 are level 4-5)
    expect(normalized.computed.severeRate).toBeGreaterThan(50);

    const severeRiskFactor = result.factors.find((f) => f.name === 'Severe care level');
    expect(severeRiskFactor).toBeDefined();
    expect(severeRiskFactor?.weightedScore).toBe(22.5); // 15 * 1.5
  });

  it('should recommend plans based on score', () => {
    const normalized = normalizeScenario(mockScenario);
    const result = calculateRisk(normalized, mockRuleSet);

    expect(result.recommendedPlans).toBeDefined();
    expect(Array.isArray(result.recommendedPlans)).toBe(true);
  });

  it('should calculate category scores', () => {
    const normalized = normalizeScenario(mockScenario);
    const result = calculateRisk(normalized, mockRuleSet);

    expect(result.categoryScores).toBeDefined();
    expect(result.categoryScores['Residents']).toBeDefined();
    expect(result.categoryScores['Residents'].score).toBeGreaterThan(0);
  });

  it('should include metadata', () => {
    const normalized = normalizeScenario(mockScenario);
    const result = calculateRisk(normalized, mockRuleSet);

    expect(result.metadata).toBeDefined();
    expect(result.metadata.ruleSetName).toBe('test-rules');
    expect(result.metadata.ruleVersion).toBe('1.0.0');
    expect(result.metadata.evaluatedAt).toBeDefined();
  });
});
