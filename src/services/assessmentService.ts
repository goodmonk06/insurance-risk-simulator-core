/**
 * Assessment service
 */

import { prisma } from '../utils/db';
import { ApiError } from '../utils/apiResponse';
import { calculateRisk } from '../engine/riskCalculator';
import { normalizeScenario } from '../models/scenario';
import { loadRulesFromFile } from '../engine/ruleLoader';
import * as path from 'path';

export class AssessmentService {
  async assessScenario(scenarioId: string, ruleSetPath?: string) {
    // Find scenario
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario) {
      throw new ApiError(404, 'Scenario not found', 'SCENARIO_NOT_FOUND');
    }

    // Load rules
    const rulesPath = ruleSetPath || path.join(process.cwd(), 'rules/sample-care-home.yml');
    const ruleSet = loadRulesFromFile(rulesPath);

    // Normalize scenario
    const normalizedScenario = normalizeScenario(scenario.data as any);

    // Calculate risk
    const result = calculateRisk(normalizedScenario, ruleSet);

    // Save assessment
    const assessment = await prisma.assessment.create({
      data: {
        scenarioId: scenario.id,
        ruleSetName: result.metadata.ruleSetName,
        ruleSetVersion: result.metadata.ruleVersion,
        totalScore: result.totalScore,
        rank: result.rank,
        result: result as any,
      },
    });

    return assessment;
  }

  async findByScenarioId(scenarioId: string) {
    return await prisma.assessment.findMany({
      where: { scenarioId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        scenario: true,
      },
    });

    if (!assessment) {
      throw new ApiError(404, 'Assessment not found', 'ASSESSMENT_NOT_FOUND');
    }

    return assessment;
  }
}

export const assessmentService = new AssessmentService();
