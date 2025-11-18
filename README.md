# insurance-risk-simulator-core

介護・医療領域の保険リスクをシナリオ別にシミュレーションするエンジン。入力条件とルールをYAMLで定義できるコア。

## 概要

このシミュレータは、介護施設や医療施設のリスク評価を自動化し、適切な保険プランを推奨するためのツールです。

### 主な機能

- **ルールベースのリスク評価**: YAMLファイルで定義されたルールに基づいて、施設のリスクを多角的に評価
- **柔軟な条件設定**: 年齢、要介護度、人員配置、設備、事故履歴など多様な要因を考慮
- **自動プラン推奨**: リスクスコアとランクに応じて、最適な保険プランを自動提案
- **拡張可能な設計**: 新しいルールやファクターを簡単に追加可能

## Tech Stack

- **Node.js** + **TypeScript**: 型安全な実装
- **js-yaml**: YAMLルールファイルのパース
- **Commander**: CLI実装

## ディレクトリ構成

```
insurance-risk-simulator-core/
├── src/
│   ├── engine/
│   │   ├── ruleLoader.ts      # YAMLルールの読み込み
│   │   └── riskCalculator.ts  # リスク計算エンジン
│   ├── models/
│   │   ├── scenario.ts         # シナリオのデータ構造
│   │   └── result.ts           # 評価結果のデータ構造
│   └── cli.ts                  # CLIエントリーポイント
├── rules/
│   └── sample-care-home.yml    # サンプルルールファイル
├── examples/
│   ├── sample-scenario.json    # 標準的なシナリオ例
│   └── high-risk-scenario.json # ハイリスクシナリオ例
└── dist/                       # ビルド出力
```

## Getting Started

### インストール

```bash
npm install
```

### ビルド

```bash
npm run build
```

### 使い方

#### 1. リスク評価の実行

```bash
npm run dev -- run --rules rules/sample-care-home.yml --input examples/sample-scenario.json
```

または、ビルド後：

```bash
npm start run --rules rules/sample-care-home.yml --input examples/sample-scenario.json
```

#### 2. 詳細モードで実行

```bash
npm run dev -- run --rules rules/sample-care-home.yml --input examples/sample-scenario.json --verbose
```

#### 3. 結果をファイルに保存

```bash
npm run dev -- run --rules rules/sample-care-home.yml --input examples/sample-scenario.json --output result.json
```

#### 4. ルールファイルの検証

```bash
npm run dev -- validate --rules rules/sample-care-home.yml
```

## YAMLルールフォーマット

ルールファイルは以下の構造を持ちます：

### 基本構造

```yaml
name: "ルールセット名"
version: "1.0.0"
description: "説明"

# リスクランク閾値
rankThresholds:
  A: 20    # 0-20: 優良
  B: 40    # 21-40: 良好
  C: 60    # 41-60: 標準
  D: 80    # 61-80: 要注意
  # 81以上: E (危険)

# リスク評価ルール
riskRules:
  - name: "ルール名"
    category: "カテゴリ"
    description: "説明"
    conditions:
      - field: "フィールドパス（ドット記法）"
        operator: "演算子"  # eq, gt, gte, lt, lte, in, between
        value: 値
    score: 10        # 基礎スコア
    weight: 1.5      # 重み係数

# 保険プラン推奨ルール
planRules:
  - id: "plan-id"
    name: "プラン名"
    description: "説明"
    priority: 1      # 優先度（小さいほど優先）
    conditions:
      minScore: 61   # 最小スコア（オプション）
      maxScore: 80   # 最大スコア（オプション）
      ranks: ["D", "E"]  # 対象ランク（オプション）
      custom:        # カスタム条件（オプション）
        - field: "フィールドパス"
          operator: "演算子"
          value: 値
    reasonTemplate: "推奨理由テンプレート（{{score}}、{{rank}}が利用可能）"
```

### 条件演算子

- `eq`: 等しい
- `gt`: より大きい
- `gte`: 以上
- `lt`: より小さい
- `lte`: 以下
- `in`: 配列に含まれる
- `between`: 範囲内（[min, max]）

### フィールドパス例

- `residents.averageAge`: 入居者の平均年齢
- `computed.severeRate`: 重度者比率（自動計算）
- `staffing.residentToStaffRatio`: 入居者:職員比率
- `facilities.sprinkler`: スプリンクラー設置状況
- `incidents.falls`: 転倒事故件数

## 入力シナリオフォーマット

入力シナリオはJSON形式で記述します：

```json
{
  "facility": {
    "name": "施設名",
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
    "medicalEquipment": ["AED", "酸素吸入器"]
  },
  "incidents": {
    "falls": 8,
    "aspiration": 0,
    "infection": 3,
    "wandering": 2
  }
}
```

## 評価結果フォーマット

評価結果は以下の情報を含みます：

- **totalScore**: 総合リスクスコア
- **rank**: リスクランク（A〜E）
- **factors**: 個別のリスクファクター詳細
- **categoryScores**: カテゴリ別スコア集計
- **recommendedPlans**: 推奨保険プラン一覧
- **summary**: 評価サマリー（主要リスク、改善推奨、総評）
- **metadata**: 評価日時、ルールセット情報

## 拡張ポイント

### 1. 新しいリスクファクターの追加

`rules/sample-care-home.yml`に新しいルールを追加：

```yaml
riskRules:
  - name: "新しいリスク要因"
    category: "新カテゴリ"
    conditions:
      - field: "新しいフィールド"
        operator: "gt"
        value: 10
    score: 5
    weight: 1.0
```

### 2. 新しい施設タイプへの対応

1. `src/models/scenario.ts`に新しいインターフェースを追加
2. 対応するルールファイルを`rules/`に作成
3. 入力シナリオのフォーマットを定義

### 3. カスタム計算ロジックの追加

`src/models/scenario.ts`の`normalizeScenario`関数で、追加の計算プロパティを定義できます。

### 4. 新しい保険プランの追加

ルールファイルの`planRules`セクションに新しいプランを追加：

```yaml
planRules:
  - id: "new-plan"
    name: "新プラン"
    description: "プランの説明"
    priority: 1
    conditions:
      minScore: 50
      maxScore: 70
    reasonTemplate: "カスタム推奨理由"
```

### 5. 外部データソースとの連携

将来的な拡張として：

- データベース（PostgreSQL等）からのシナリオ読み込み
- REST APIでの評価実行
- バッチ処理機能
- レポート生成機能

## 開発ロードマップ

- [ ] ユニットテスト追加
- [ ] バリデーション強化
- [ ] Web APIサーバー実装
- [ ] フロントエンドUI
- [ ] レポート生成機能
- [ ] 統計分析機能
- [ ] 機械学習モデルとの統合

## License

MIT
