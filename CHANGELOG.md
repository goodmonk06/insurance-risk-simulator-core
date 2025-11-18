# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Phase 3 Foundation

### Added

#### Domain Model Expansion
- **Organization**: Multi-tenant support with organization management
- **User**: User accounts with roles (ADMIN, ANALYST, VIEWER, AUDITOR)
- **Template**: Reusable scenario templates with categories
- **Report**: Automated report generation with multiple export formats
- **Alert**: Risk threshold-based alerting system
- **AuditLog**: Comprehensive activity tracking and compliance logging
- **Tag**: Flexible categorization system for scenarios, templates, and reports

#### Enhanced Existing Entities
- **Scenario**: Added status (DRAFT, ACTIVE, ARCHIVED), description, metadata, organizationId, createdById, templateId
- **Assessment**: Added executedById, executionTime tracking, relations to reports and alerts
- **RuleSet**: No changes (maintained backwards compatibility)

#### Infrastructure
- **Logger**: Structured logging with contextual information (`src/lib/logger.ts`)
- **Metrics**: Metrics collection abstraction for observability (`src/lib/metrics.ts`)
- **Notification Adapter**: Extensible notification system with interface and stub implementation

#### Documentation
- **PHASE3_OVERVIEW.md**: Comprehensive Phase 3 plan and roadmap
- **CHANGELOG.md**: Version history tracking

### Changed

#### Breaking Changes
- **Database Schema**: Major schema migration required
  - Existing `Scenario` and `Assessment` tables have new required foreign keys
  - Migration path: Create default organization and user before migrating existing data

#### Backwards Compatibility Notes
- Existing Prisma client code will need updates to handle new required fields
- API endpoints maintain existing shapes but require authentication context (to be implemented)
- Seed scripts updated to populate new entities

### Migration Guide

For existing installations:

```bash
# 1. Backup your database
pg_dump insurance_risk_simulator > backup.sql

# 2. Run new migrations
npm run db:push

# 3. Run updated seed to create default organization/user
npm run db:seed

# 4. Update application code to pass organizationId and userId
```

## [1.0.0] - 2025-01-XX - Phase 2 Complete

### Added
- REST API Server with Express + TypeScript
- PostgreSQL database with Prisma ORM
- Full CRUD operations for Scenarios and Assessments
- Zod validation for all API inputs
- Centralized error handling
- Docker and Docker Compose support
- Vitest testing framework with 24 passing tests
- Comprehensive README documentation
- CLI tool for batch operations

### Initial Entities
- **Scenario**: Care facility risk scenarios
- **Assessment**: Risk evaluation results
- **RuleSet**: YAML-based rule configurations

## [0.1.0] - Initial Release

### Added
- Risk calculation engine
- YAML-based rule system
- CLI tool for risk assessment
- Basic TypeScript setup
