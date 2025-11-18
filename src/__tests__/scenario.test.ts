/**
 * Scenario Model Tests
 */

import { describe, it, expect } from 'vitest';
import { normalizeScenario } from '../models/scenario';
import { determineRiskRank } from '../models/result';

describe('Scenario Model', () => {
  describe('normalizeScenario', () => {
    it('should calculate average care level correctly', () => {
      const scenario = {
        facility: {
          name: 'Test',
          type: 'Home',
          capacity: 50,
        },
        residents: {
          total: 50,
          averageAge: 85,
          careLevel: {
            level1: 10, // 10 * 1 = 10
            level2: 10, // 10 * 2 = 20
            level3: 10, // 10 * 3 = 30
            level4: 10, // 10 * 4 = 40
            level5: 10, // 10 * 5 = 50
          },
          dementia: 25,
          medicalCare: 15,
        },
        staffing: {
          careWorkers: 20,
          nurses: 4,
          residentToStaffRatio: 2.5,
          nightShiftStaff: 3,
        },
        facilities: {
          sprinkler: true,
          fireAlarm: true,
          barrierFree: true,
          medicalEquipment: [],
        },
      };

      const normalized = normalizeScenario(scenario);

      // Total = 10+20+30+40+50 = 150, Average = 150/50 = 3.0
      expect(normalized.computed.averageCareLevel).toBe(3.0);
    });

    it('should calculate occupancy rate correctly', () => {
      const scenario = {
        facility: {
          name: 'Test',
          type: 'Home',
          capacity: 100,
        },
        residents: {
          total: 80,
          averageAge: 85,
          careLevel: {
            level1: 20,
            level2: 20,
            level3: 20,
            level4: 10,
            level5: 10,
          },
          dementia: 40,
          medicalCare: 20,
        },
        staffing: {
          careWorkers: 30,
          nurses: 5,
          residentToStaffRatio: 2.67,
          nightShiftStaff: 4,
        },
        facilities: {
          sprinkler: true,
          fireAlarm: true,
          barrierFree: true,
          medicalEquipment: [],
        },
      };

      const normalized = normalizeScenario(scenario);

      // 80 / 100 * 100 = 80%
      expect(normalized.computed.occupancyRate).toBe(80);
    });

    it('should calculate severe rate correctly', () => {
      const scenario = {
        facility: {
          name: 'Test',
          type: 'Home',
          capacity: 100,
        },
        residents: {
          total: 100,
          averageAge: 85,
          careLevel: {
            level1: 20,
            level2: 20,
            level3: 20,
            level4: 25,
            level5: 15,
          },
          dementia: 50,
          medicalCare: 30,
        },
        staffing: {
          careWorkers: 35,
          nurses: 6,
          residentToStaffRatio: 2.86,
          nightShiftStaff: 5,
        },
        facilities: {
          sprinkler: true,
          fireAlarm: true,
          barrierFree: true,
          medicalEquipment: [],
        },
      };

      const normalized = normalizeScenario(scenario);

      // Severe = level4 + level5 = 25 + 15 = 40
      // Rate = 40 / 100 * 100 = 40%
      expect(normalized.computed.severeRate).toBe(40);
    });

    it('should calculate dementia rate correctly', () => {
      const scenario = {
        facility: {
          name: 'Test',
          type: 'Home',
          capacity: 100,
        },
        residents: {
          total: 100,
          averageAge: 85,
          careLevel: {
            level1: 20,
            level2: 20,
            level3: 20,
            level4: 20,
            level5: 20,
          },
          dementia: 60,
          medicalCare: 30,
        },
        staffing: {
          careWorkers: 35,
          nurses: 6,
          residentToStaffRatio: 2.86,
          nightShiftStaff: 5,
        },
        facilities: {
          sprinkler: true,
          fireAlarm: true,
          barrierFree: true,
          medicalEquipment: [],
        },
      };

      const normalized = normalizeScenario(scenario);

      // 60 / 100 * 100 = 60%
      expect(normalized.computed.dementiaRate).toBe(60);
    });
  });
});

describe('Result Model', () => {
  describe('determineRiskRank', () => {
    const thresholds = {
      A: 20,
      B: 40,
      C: 60,
      D: 80,
    };

    it('should return A for low scores', () => {
      expect(determineRiskRank(10, thresholds)).toBe('A');
      expect(determineRiskRank(20, thresholds)).toBe('A');
    });

    it('should return B for moderate-low scores', () => {
      expect(determineRiskRank(21, thresholds)).toBe('B');
      expect(determineRiskRank(40, thresholds)).toBe('B');
    });

    it('should return C for moderate scores', () => {
      expect(determineRiskRank(41, thresholds)).toBe('C');
      expect(determineRiskRank(60, thresholds)).toBe('C');
    });

    it('should return D for moderate-high scores', () => {
      expect(determineRiskRank(61, thresholds)).toBe('D');
      expect(determineRiskRank(80, thresholds)).toBe('D');
    });

    it('should return E for high scores', () => {
      expect(determineRiskRank(81, thresholds)).toBe('E');
      expect(determineRiskRank(100, thresholds)).toBe('E');
      expect(determineRiskRank(200, thresholds)).toBe('E');
    });
  });
});
