# Insurance Risk Simulator Core

介護・医療施設向けの保険リスク評価システム。YAMLで定義されたルールに基づいて施設のリスクを多角的に評価し、適切な保険プランを推奨します。

## Overview

このシステムは介護施設や医療施設のリスクファクター（年齢、要介護度、人員配置、設備、事故履歴など）を総合的に評価し、リスクスコアとランク（A〜E）を算出します。REST APIとCLIの両方を提供し、柔軟な運用が可能です。

### Key Features

- **REST API Server**: Express + TypeScript + Prisma によるタイプセーフなAPI
- **Rule-Based Engine**: YAMLで定義可能なルールエンジン
- **Database-Backed**: PostgreSQLでシナリオと評価結果を永続化
- **Validation**: Zodによる厳密な入力バリデーション
- **Docker Support**: docker-composeで即座に起動可能
- **CLI Tool**: コマンドラインでの評価も対応
- **Tested**: Vitestによる包括的なテストスイート

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3
- **Web Framework**: Express 4
- **Database**: PostgreSQL 16 with Prisma ORM
- **Validation**: Zod
- **Testing**: Vitest
- **Containerization**: Docker & Docker Compose

## Domain Model

### Entities

```
Scenario (シナリオ)
├── id: UUID
├── name: string
├── data: JSON (CareHomeScenario)
├── createdAt: DateTime
├── updatedAt: DateTime
└── assessments: Assessment[]

Assessment (評価結果)
├── id: UUID
├── scenarioId: UUID
├── ruleSetName: string
├── ruleSetVersion: string
├── totalScore: number
├── rank: string (A-E)
├── result: JSON (RiskAssessmentResult)
├── createdAt: DateTime
└── scenario: Scenario

RuleSet (ルールセット)
├── id: UUID
├── name: string (unique)
├── version: string
├── description: string
├── rules: JSON
├── active: boolean
├── createdAt: DateTime
└── updatedAt: DateTime
```

### CareHomeScenario Structure

- **facility**: 施設情報（名称、タイプ、定員）
- **residents**: 入居者情報（総数、平均年齢、要介護度分布、認知症、医療ケア）
- **staffing**: 人員配置（介護職員数、看護職員数、比率、夜勤体制）
- **facilities**: 設備（スプリンクラー、火災報知器、バリアフリー、医療機器）
- **incidents**: 事故履歴（転倒、誤嚥、感染症、離設）

## Getting Started

### Requirements

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (Dockerを使う場合は不要)

### Quick Start with Docker

最も簡単な方法はDocker Composeを使用することです：

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd insurance-risk-simulator-core

# 2. 環境変数をコピー
cp .env.example .env

# 3. Docker Composeで起動（データベース + アプリ）
docker compose up -d

# 4. ログを確認
docker compose logs -f app

# アクセス
# API: http://localhost:3000
# Health check: http://localhost:3000/api/health
```

### Local Development Setup

ローカルで開発する場合：

```bash
# 1. 依存関係をインストール
npm install

# 2. 環境変数を設定
cp .env.example .env
# .envを編集してDATABASE_URLを設定

# 3. PostgreSQLを起動（Docker Composeを使う場合）
docker compose up postgres -d

# 4. データベースをセットアップ
npm run db:push      # スキーマをデータベースに反映
npm run db:generate  # Prisma Clientを生成
npm run db:seed      # サンプルデータを投入

# 5. 開発サーバーを起動（ホットリロード付き）
npm run dev

# 別ターミナルでテストを実行
npm test

# 型チェック
npm run lint
```

## API Endpoints

### Scenarios

```bash
# シナリオ一覧を取得
GET /api/scenarios?page=1&limit=10

# シナリオを作成
POST /api/scenarios
Content-Type: application/json
{
  "name": "テスト施設",
  "data": { ... }
}

# シナリオ詳細を取得
GET /api/scenarios/:id

# シナリオを更新
PATCH /api/scenarios/:id
Content-Type: application/json
{
  "name": "新しい名前"
}

# シナリオを削除
DELETE /api/scenarios/:id
```

### Assessments

```bash
# シナリオを評価
POST /api/assessments/scenarios/:scenarioId/assess

# シナリオの評価履歴を取得
GET /api/assessments/scenarios/:scenarioId

# 評価詳細を取得
GET /api/assessments/:id
```

### Health Check

```bash
# ヘルスチェック
GET /api/health
```

## Example Flow: Creating and Assessing a Scenario

完全なエンドツーエンドのフローを実行してみましょう：

### 1. シナリオを作成

```bash
curl -X POST http://localhost:3000/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "さくら介護ホーム",
    "data": {
      "facility": {
        "name": "さくら介護ホーム",
        "type": "特別養護老人ホーム",
        "capacity": 80
      },
      "residents": {
        "total": 72,
        "averageAge": 86,
        "careLevel": {
          "level1": 5,
          "level2": 10,
          "level3": 15,
          "level4": 22,
          "level5": 20
        },
        "dementia": 48,
        "medicalCare": 18
      },
      "staffing": {
        "careWorkers": 24,
        "nurses": 3,
        "residentToStaffRatio": 3.0,
        "nightShiftStaff": 3
      },
      "facilities": {
        "sprinkler": true,
        "fireAlarm": true,
        "barrierFree": true,
        "medicalEquipment": ["AED", "酸素吸入器", "吸引器"]
      },
      "incidents": {
        "falls": 8,
        "aspiration": 0,
        "infection": 3,
        "wandering": 2
      }
    }
  }'
```

### 2. リスク評価を実行

```bash
# 上記のレスポンスから取得したシナリオIDを使用
curl -X POST http://localhost:3000/api/assessments/scenarios/<SCENARIO_ID>/assess
```

### 3. 評価結果を確認

```bash
curl http://localhost:3000/api/assessments/scenarios/<SCENARIO_ID>
```

### 4. 全シナリオを一覧表示

```bash
curl http://localhost:3000/api/scenarios
```

## CLI Usage

APIサーバーとは別に、CLIツールも利用可能です：

```bash
# CLIでリスク評価を実行
npm run dev:cli -- run \
  --rules rules/sample-care-home.yml \
  --input examples/sample-scenario.json \
  --verbose

# ルールファイルを検証
npm run dev:cli -- validate --rules rules/sample-care-home.yml

# ビルド後の実行
npm run build
npm run start:cli -- run --rules rules/sample-care-home.yml --input examples/sample-scenario.json
```

## Scripts

```bash
# Development
npm run dev          # APIサーバーを起動（ホットリロード）
npm run dev:cli      # CLIツールを実行

# Build
npm run build        # TypeScriptをビルド
npm run start        # ビルド済みAPIサーバーを起動
npm run start:cli    # ビルド済みCLIを起動

# Testing
npm test             # テストを実行
npm run test:watch   # テストをwatch モードで実行

# Linting
npm run lint         # 型チェック

# Database
npm run db:generate  # Prisma Clientを生成
npm run db:push      # スキーマをデータベースに反映（開発用）
npm run db:migrate   # マイグレーションを作成・適用（本番用）
npm run db:seed      # サンプルデータを投入
npm run db:studio    # Prisma Studioを起動（GUI）

# Cleanup
npm run clean        # ビルド成果物を削除
```

## Testing

```bash
# 全テストを実行
npm test

# Watch モードでテスト
npm run test:watch

# テストファイルの場所
src/__tests__/
├── riskCalculator.test.ts   # リスク計算エンジンのテスト
├── validation.test.ts        # バリデーションのテスト
└── scenario.test.ts          # モデルのテスト
```

## Database Management

```bash
# Prisma Studioでデータを確認・編集（GUI）
npm run db:studio

# マイグレーションの作成
npm run db:migrate

# データベースをリセットしてシードを再投入
npm run db:push && npm run db:seed
```

## Demo Data

シードスクリプトを実行すると、以下のサンプルデータが投入されます：

1. **さくら介護ホーム** (標準リスク)
   - 総合スコア: 約27点
   - ランク: B (良好)

2. **ひまわり介護ホーム** (ハイリスク)
   - 総合スコア: 約169点
   - ランク: E (危険)

3. **みどり介護ホーム** (低リスク)
   - 総合スコア: 約10点以下
   - ランク: A (優良)

## Project Structure

```
insurance-risk-simulator-core/
├── prisma/
│   ├── schema.prisma        # Prismaスキーマ
│   └── seed.ts             # シードスクリプト
├── src/
│   ├── __tests__/          # テストファイル
│   ├── controllers/        # APIコントローラー
│   ├── engine/             # リスク計算エンジン
│   ├── middleware/         # Expressミドルウェア
│   ├── models/             # データモデル
│   ├── routes/             # APIルート
│   ├── services/           # ビジネスロジック
│   ├── utils/              # ユーティリティ
│   ├── validation/         # Zodスキーマ
│   ├── app.ts             # Expressアプリ設定
│   ├── server.ts          # サーバーエントリーポイント
│   └── cli.ts             # CLIエントリーポイント
├── rules/
│   └── sample-care-home.yml # サンプルルールセット
├── examples/
│   ├── sample-scenario.json
│   └── high-risk-scenario.json
├── docker-compose.yml      # Docker Compose設定
├── Dockerfile             # Dockerイメージ定義
├── vitest.config.ts       # Vitest設定
├── tsconfig.json          # TypeScript設定
└── package.json           # npm設定
```

## Environment Variables

`.env`ファイルで設定可能な環境変数：

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/insurance_risk_simulator?schema=public

# Server
PORT=3000
NODE_ENV=development

# API
API_PREFIX=/api
```

## Rule Format

ルールはYAML形式で定義します。詳細は `rules/sample-care-home.yml` を参照してください。

### Rule Structure

```yaml
name: "rule-set-name"
version: "1.0.0"
description: "Rule set description"

rankThresholds:
  A: 20    # 0-20: Excellent
  B: 40    # 21-40: Good
  C: 60    # 41-60: Fair
  D: 80    # 61-80: Poor
  # 81+: E (Critical)

riskRules:
  - name: "Rule name"
    category: "Category"
    description: "Description"
    conditions:
      - field: "residents.averageAge"
        operator: "gte"  # eq, gt, gte, lt, lte, in, between
        value: 85
    score: 10
    weight: 1.5

planRules:
  - id: "plan-id"
    name: "Plan name"
    description: "Plan description"
    priority: 1
    conditions:
      minScore: 61
      maxScore: 80
      ranks: ["D", "E"]
    reasonTemplate: "Recommendation reason with {{score}} and {{rank}}"
```

## Future Extensions

Phase 2で実装された機能をベースに、以下の拡張が可能です：

### Near Term
- [ ] 認証・認可（JWT, OAuth）
- [ ] ユーザー管理とマルチテナント対応
- [ ] レポート生成（PDF, Excel）
- [ ] リアルタイム通知（WebSocket）
- [ ] カスタムルールセットのUI管理

### Medium Term
- [ ] フロントエンドダッシュボード（React/Vue）
- [ ] 統計分析とトレンド表示
- [ ] バッチ評価機能
- [ ] ルールのバージョン管理
- [ ] 外部システム連携（API統合）

### Long Term
- [ ] 機械学習モデルによる予測
- [ ] 時系列分析
- [ ] マルチ言語対応
- [ ] クラウドネイティブ化（Kubernetes）
- [ ] GraphQL API

## Troubleshooting

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
docker compose ps

# PostgreSQLのログを確認
docker compose logs postgres

# データベースをリセット
docker compose down -v
docker compose up -d
npm run db:push
npm run db:seed
```

### ポート競合

```bash
# .envファイルでポートを変更
PORT=3001
```

### Prisma Client エラー

```bash
# Prisma Clientを再生成
npm run db:generate
```

## Contributing

1. ブランチを作成
2. 変更を実装
3. テストを追加・実行
4. PRを作成

## License

MIT

---

## Quick Reference

```bash
# 🚀 Quick Start
docker compose up -d
docker compose logs -f app

# 🧪 Development
npm install
npm run db:push && npm run db:seed
npm run dev

# ✅ Testing
npm test

# 📦 Build
npm run build
npm start
```

For more information, see the [full documentation](./docs).
