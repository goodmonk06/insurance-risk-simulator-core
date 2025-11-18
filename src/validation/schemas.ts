/**
 * Zod validation schemas
 */

import { z } from 'zod';

// Care Level schema
export const careLevelSchema = z.object({
  level1: z.number().int().min(0),
  level2: z.number().int().min(0),
  level3: z.number().int().min(0),
  level4: z.number().int().min(0),
  level5: z.number().int().min(0),
});

// Facility schema
export const facilitySchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  capacity: z.number().int().positive(),
});

// Residents schema
export const residentsSchema = z.object({
  total: z.number().int().min(0),
  averageAge: z.number().positive().max(120),
  careLevel: careLevelSchema,
  dementia: z.number().int().min(0),
  medicalCare: z.number().int().min(0),
});

// Staffing schema
export const staffingSchema = z.object({
  careWorkers: z.number().positive(),
  nurses: z.number().min(0),
  residentToStaffRatio: z.number().positive(),
  nightShiftStaff: z.number().int().min(0),
});

// Facilities schema
export const facilitiesSchema = z.object({
  sprinkler: z.boolean(),
  fireAlarm: z.boolean(),
  barrierFree: z.boolean(),
  medicalEquipment: z.array(z.string()),
});

// Incidents schema
export const incidentsSchema = z.object({
  falls: z.number().int().min(0).optional(),
  aspiration: z.number().int().min(0).optional(),
  infection: z.number().int().min(0).optional(),
  wandering: z.number().int().min(0).optional(),
}).optional();

// Main CareHomeScenario schema
export const careHomeScenarioSchema = z.object({
  facility: facilitySchema,
  residents: residentsSchema,
  staffing: staffingSchema,
  facilities: facilitiesSchema,
  incidents: incidentsSchema,
});

// Create scenario request schema
export const createScenarioSchema = z.object({
  name: z.string().min(1).max(255),
  data: careHomeScenarioSchema,
});

// Update scenario request schema
export const updateScenarioSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  data: careHomeScenarioSchema.optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Types
export type CareHomeScenarioInput = z.infer<typeof careHomeScenarioSchema>;
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;
export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
