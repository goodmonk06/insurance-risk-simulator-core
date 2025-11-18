/**
 * Scenario service
 */

import { prisma } from '../utils/db';
import { ApiError } from '../utils/apiResponse';
import { CreateScenarioInput, UpdateScenarioInput, PaginationInput } from '../validation/schemas';

// TODO: Replace with actual auth context in Phase 3+
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export class ScenarioService {
  async create(input: CreateScenarioInput, organizationId: string = DEFAULT_ORG_ID, createdById: string = DEFAULT_USER_ID) {
    return await prisma.scenario.create({
      data: {
        name: input.name,
        data: input.data as any,
        organizationId,
        createdById,
        status: 'ACTIVE',
      },
    });
  }

  async findAll(pagination: PaginationInput) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [scenarios, total] = await Promise.all([
      prisma.scenario.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: { assessments: true },
          },
        },
      }),
      prisma.scenario.count(),
    ]);

    return {
      scenarios,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const scenario = await prisma.scenario.findUnique({
      where: { id },
      include: {
        assessments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!scenario) {
      throw new ApiError(404, 'Scenario not found', 'SCENARIO_NOT_FOUND');
    }

    return scenario;
  }

  async update(id: string, input: UpdateScenarioInput) {
    try {
      return await prisma.scenario.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.data && { data: input.data as any }),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'Scenario not found', 'SCENARIO_NOT_FOUND');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await prisma.scenario.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'Scenario not found', 'SCENARIO_NOT_FOUND');
      }
      throw error;
    }
  }
}

export const scenarioService = new ScenarioService();
