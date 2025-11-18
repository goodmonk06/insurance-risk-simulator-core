/**
 * Validation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  careHomeScenarioSchema,
  createScenarioSchema,
  paginationSchema
} from '../validation/schemas';

describe('Validation Schemas', () => {
  describe('careHomeScenarioSchema', () => {
    it('should validate a complete valid scenario', () => {
      const validScenario = {
        facility: {
          name: 'Test Facility',
          type: 'Nursing Home',
          capacity: 50,
        },
        residents: {
          total: 40,
          averageAge: 85,
          careLevel: {
            level1: 5,
            level2: 10,
            level3: 10,
            level4: 10,
            level5: 5,
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
          medicalEquipment: ['AED', 'Oxygen'],
        },
        incidents: {
          falls: 5,
          aspiration: 1,
          infection: 2,
          wandering: 1,
        },
      };

      const result = careHomeScenarioSchema.safeParse(validScenario);
      expect(result.success).toBe(true);
    });

    it('should reject scenario with negative values', () => {
      const invalidScenario = {
        facility: {
          name: 'Test',
          type: 'Home',
          capacity: -10, // Invalid
        },
        residents: {
          total: 40,
          averageAge: 85,
          careLevel: {
            level1: -5, // Invalid
            level2: 10,
            level3: 10,
            level4: 10,
            level5: 5,
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
          medicalEquipment: [],
        },
      };

      const result = careHomeScenarioSchema.safeParse(invalidScenario);
      expect(result.success).toBe(false);
    });

    it('should accept scenario without incidents', () => {
      const validScenario = {
        facility: {
          name: 'Test',
          type: 'Home',
          capacity: 50,
        },
        residents: {
          total: 40,
          averageAge: 85,
          careLevel: {
            level1: 10,
            level2: 10,
            level3: 10,
            level4: 5,
            level5: 5,
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
          medicalEquipment: [],
        },
      };

      const result = careHomeScenarioSchema.safeParse(validScenario);
      expect(result.success).toBe(true);
    });
  });

  describe('createScenarioSchema', () => {
    it('should validate creation request', () => {
      const validRequest = {
        name: 'Test Scenario',
        data: {
          facility: {
            name: 'Test',
            type: 'Home',
            capacity: 50,
          },
          residents: {
            total: 40,
            averageAge: 85,
            careLevel: {
              level1: 10,
              level2: 10,
              level3: 10,
              level4: 5,
              level5: 5,
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
            medicalEquipment: [],
          },
        },
      };

      const result = createScenarioSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject request without name', () => {
      const invalidRequest = {
        data: {
          facility: {
            name: 'Test',
            type: 'Home',
            capacity: 50,
          },
          residents: {
            total: 40,
            averageAge: 85,
            careLevel: {
              level1: 10,
              level2: 10,
              level3: 10,
              level4: 5,
              level5: 5,
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
            medicalEquipment: [],
          },
        },
      };

      const result = createScenarioSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should use default values', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should parse string numbers', () => {
      const result = paginationSchema.parse({ page: '2', limit: '20' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should reject invalid page numbers', () => {
      const result = paginationSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('should enforce max limit', () => {
      const result = paginationSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });
});
