/**
 * Database seed script
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Read sample scenarios
  const sampleScenarioPath = path.join(__dirname, '../examples/sample-scenario.json');
  const highRiskScenarioPath = path.join(__dirname, '../examples/high-risk-scenario.json');

  const sampleScenarioData = JSON.parse(fs.readFileSync(sampleScenarioPath, 'utf8'));
  const highRiskScenarioData = JSON.parse(fs.readFileSync(highRiskScenarioPath, 'utf8'));

  // Create scenarios
  const scenario1 = await prisma.scenario.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'さくら介護ホーム（標準リスク）',
      data: sampleScenarioData,
    },
  });
  console.log('✓ Created scenario:', scenario1.name);

  const scenario2 = await prisma.scenario.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'ひまわり介護ホーム（ハイリスク）',
      data: highRiskScenarioData,
    },
  });
  console.log('✓ Created scenario:', scenario2.name);

  // Create additional realistic scenarios
  const scenario3 = await prisma.scenario.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'みどり介護ホーム（低リスク）',
      data: {
        facility: {
          name: 'みどり介護ホーム',
          type: '介護老人保健施設',
          capacity: 60,
        },
        residents: {
          total: 50,
          averageAge: 78,
          careLevel: {
            level1: 15,
            level2: 18,
            level3: 12,
            level4: 3,
            level5: 2,
          },
          dementia: 15,
          medicalCare: 5,
        },
        staffing: {
          careWorkers: 20,
          nurses: 5,
          residentToStaffRatio: 2.5,
          nightShiftStaff: 4,
        },
        facilities: {
          sprinkler: true,
          fireAlarm: true,
          barrierFree: true,
          medicalEquipment: ['AED', '酸素吸入器', '吸引器', '人工呼吸器'],
        },
        incidents: {
          falls: 2,
          aspiration: 0,
          infection: 1,
          wandering: 0,
        },
      },
    },
  });
  console.log('✓ Created scenario:', scenario3.name);

  // Load and create rule set
  const ruleSetPath = path.join(__dirname, '../rules/sample-care-home.yml');
  const ruleSetYaml = fs.readFileSync(ruleSetPath, 'utf8');
  const yaml = require('js-yaml');
  const ruleSetData = yaml.load(ruleSetYaml);

  const ruleSet = await prisma.ruleSet.upsert({
    where: { name: ruleSetData.name },
    update: {
      version: ruleSetData.version,
      description: ruleSetData.description,
      rules: ruleSetData,
    },
    create: {
      name: ruleSetData.name,
      version: ruleSetData.version,
      description: ruleSetData.description,
      rules: ruleSetData,
      active: true,
    },
  });
  console.log('✓ Created rule set:', ruleSet.name);

  console.log('\nSeed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('  - Scenario 1 (Low Risk): さくら介護ホーム');
  console.log('  - Scenario 2 (High Risk): ひまわり介護ホーム');
  console.log('  - Scenario 3 (Very Low Risk): みどり介護ホーム');
  console.log('\nYou can now:');
  console.log('  1. View scenarios: GET /api/scenarios');
  console.log('  2. Assess a scenario: POST /api/assessments/scenarios/:scenarioId/assess');
  console.log('  3. View assessments: GET /api/assessments/scenarios/:scenarioId');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
