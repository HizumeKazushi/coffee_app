# COFFEE RECIPE HUB 実装計画書

## 概要

コーヒー抽出の「再現性」を高め、レシピと豆情報を共有するアプリケーションの詳細実装計画。

---

## Phase 1: MVP（基盤機能）【8週間】

### 1.1 プロジェクトセットアップ【1週間】

| タスク             | 詳細                                                    | 工数  |
| :----------------- | :------------------------------------------------------ | :---- |
| Expo初期化         | `npx create-expo-app` + TypeScript設定                  | 0.5日 |
| ディレクトリ構成   | `src/screens`, `src/components`, `src/hooks`, `src/api` | 0.5日 |
| 共通スタイル       | カラーパレット、タイポグラフィ、ダークモード対応        | 1日   |
| ナビゲーション     | React Navigation (Tab + Stack)                          | 1日   |
| Go APIプロジェクト | Gin初期化、Docker設定                                   | 1日   |
| DB設計             | PostgreSQL + SQLiteスキーマ作成                         | 1日   |

---

### 1.2 認証機能【1週間】

#### フロントエンド

```
screens/
├── LoginScreen.tsx      # ログイン画面
├── RegisterScreen.tsx   # 新規登録画面
└── ProfileScreen.tsx    # プロフィール設定
```

| 機能           | 詳細                     |
| :------------- | :----------------------- |
| Emailログイン  | Firebase Auth連携        |
| Googleログイン | OAuth2.0                 |
| Appleログイン  | Apple Sign In            |
| トークン管理   | SecureStoreで安全に保存  |
| 自動ログイン   | トークン有効期限チェック |

#### バックエンド

```
POST /api/v1/auth/register   # 新規登録
POST /api/v1/auth/login      # ログイン
POST /api/v1/auth/refresh    # トークン更新
GET  /api/v1/auth/me         # ユーザー情報取得
```

---

### 1.3 豆管理機能【2週間】

#### データモデル

```typescript
interface Bean {
  id: string;
  userId: string;
  name: string; // 豆の名前
  roasterName: string; // 焙煎所名
  origin: string; // 産地
  roastLevel: RoastLevel; // 焙煎度 (LIGHT/MEDIUM/DARK)
  process: string; // 精製方法 (WASHED/NATURAL/HONEY)
  roastDate: Date; // 焙煎日
  stockGrams: number; // 在庫(g)
  flavorNotes: string[]; // フレーバーノート
  imageUrl?: string; // 豆パッケージ画像
  createdAt: Date;
  updatedAt: Date;
}
```

#### 画面設計

```
screens/beans/
├── BeanListScreen.tsx       # 豆一覧（カード形式）
├── BeanDetailScreen.tsx     # 豆詳細・編集
├── BeanAddScreen.tsx        # 豆追加フォーム
└── components/
    ├── BeanCard.tsx         # 一覧カード
    ├── RoastLevelBadge.tsx  # 焙煎度バッジ
    └── StockIndicator.tsx   # 在庫ゲージ
```

#### API設計

```
POST   /api/v1/beans              # 豆登録
GET    /api/v1/beans              # 豆一覧取得
GET    /api/v1/beans/:id          # 豆詳細取得
PUT    /api/v1/beans/:id          # 豆更新
DELETE /api/v1/beans/:id          # 豆削除
PATCH  /api/v1/beans/:id/stock    # 在庫更新（抽出時自動減算）
```

#### 追加機能

| 機能             | 詳細                                             |
| :--------------- | :----------------------------------------------- |
| エイジング通知   | 焙煎日から7-14日後を「飲み頃」としてプッシュ通知 |
| 在庫アラート     | 残り50g以下で警告表示                            |
| 焙煎度フィルター | 一覧画面でのフィルタリング                       |

---

### 1.4 レシピ管理機能【2週間】

#### データモデル

```typescript
interface Recipe {
  id: string;
  userId: string;
  title: string; // レシピ名
  equipment: Equipment; // 器具
  coffeeGrams: number; // 粉量(g)
  totalWaterMl: number; // 総湯量(ml)
  waterTemperature: number; // お湯温度(℃)
  grindSize: GrindSize; // 挽き目 (FINE/MEDIUM/COARSE)
  steps: RecipeStep[]; // 注湯ステップ
  isPublic: boolean; // 公開フラグ
  createdAt: Date;
  updatedAt: Date;
}

interface RecipeStep {
  order: number; // 順番
  label: string; // ラベル (蒸らし/1投目/2投目)
  timeSeconds: number; // 開始秒数
  waterMl: number; // 注湯量(ml)
  notes?: string; // メモ
}

type Equipment = 'V60' | 'KALITA_WAVE' | 'CHEMEX' | 'AEROPRESS' | 'FRENCH_PRESS' | 'OTHER';
```

#### 画面設計

```
screens/recipes/
├── RecipeListScreen.tsx         # レシピ一覧
├── RecipeDetailScreen.tsx       # レシピ詳細
├── RecipeEditorScreen.tsx       # レシピ作成・編集
└── components/
    ├── RecipeCard.tsx           # 一覧カード
    ├── StepTimeline.tsx         # タイムライン表示
    ├── StepEditor.tsx           # ステップ編集UI
    └── EquipmentSelector.tsx    # 器具選択
```

#### API設計

```
POST   /api/v1/recipes            # レシピ作成
GET    /api/v1/recipes            # 自分のレシピ一覧
GET    /api/v1/recipes/:id        # レシピ詳細
PUT    /api/v1/recipes/:id        # レシピ更新
DELETE /api/v1/recipes/:id        # レシピ削除
POST   /api/v1/recipes/:id/clone  # レシピ複製
```

---

### 1.5 抽出セッション（タイマー）【2週間】

#### データモデル

```typescript
interface BrewLog {
  id: string;
  userId: string;
  recipeId: string;
  beanId: string;
  brewDate: Date;
  actualDuration: number; // 実際の抽出時間(秒)
  rating: number; // 5段階評価
  tasteNotes: TasteNote[]; // 味の評価
  memo?: string; // 改善メモ
  createdAt: Date;
}

interface TasteNote {
  aspect: 'acidity' | 'bitterness' | 'sweetness' | 'body' | 'aftertaste';
  score: number; // 1-5
}
```

#### 画面設計

```
screens/brewing/
├── BrewingSessionScreen.tsx     # メイン抽出画面
├── BrewResultScreen.tsx         # 抽出結果・評価入力
└── components/
    ├── Timer.tsx                # 0.1秒単位タイマー
    ├── StepNavigator.tsx        # 次ステップナビ
    ├── PourGuide.tsx            # 注湯量ガイド（円形プログレス）
    └── RatingInput.tsx          # 5段階評価入力
```

#### タイマー実装詳細

```typescript
// 100ms精度タイマー (requestAnimationFrame使用)
const useBrewingTimer = () => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // 次のステップをハイライト
  // 振動フィードバック
  // 音声ガイド（オプション）
};
```

| 機能               | 詳細                              |
| :----------------- | :-------------------------------- |
| リアルタイムガイド | 「あと3秒で2投目」表示            |
| 振動通知           | 次ステップ開始時にHaptic Feedback |
| 音声ガイド         | オプションでステップ読み上げ      |
| オフライン対応     | SQLiteに抽出ログ保存              |

---

## Phase 2: コミュニティ機能【4週間】

### 2.1 レシピ共有【2週間】

#### 追加データモデル

```typescript
interface PublicRecipe extends Recipe {
  authorId: string;
  authorName: string;
  likeCount: number;
  brewedCount: number; // 試した人数
  averageRating: number;
}

interface RecipeLike {
  userId: string;
  recipeId: string;
  createdAt: Date;
}
```

#### 画面設計

```
screens/community/
├── CommunityFeedScreen.tsx      # コミュニティフィード
├── RecipeSearchScreen.tsx       # レシピ検索
├── PublicRecipeDetailScreen.tsx # 公開レシピ詳細
└── components/
    ├── FeedCard.tsx             # フィードカード
    ├── LikeButton.tsx           # いいねボタン
    └── BrewedItBadge.tsx        # 試した人数バッジ
```

#### API設計

```
GET    /api/v1/community/feed           # フィード取得
GET    /api/v1/community/search         # レシピ検索
POST   /api/v1/recipes/:id/like         # いいね
DELETE /api/v1/recipes/:id/like         # いいね取消
GET    /api/v1/community/trending       # 人気レシピ
```

---

### 2.2 "Brewed it!" 投稿【1週間】

#### データモデル

```typescript
interface BrewedIt {
  id: string;
  userId: string;
  recipeId: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  createdAt: Date;
}
```

#### API設計

```
POST   /api/v1/brewed-it                # やってみた投稿
GET    /api/v1/recipes/:id/brewed-it    # レシピのやってみた一覧
DELETE /api/v1/brewed-it/:id            # 投稿削除
```

---

### 2.3 フォロー機能【1週間】

#### データモデル

```typescript
interface Follow {
  followerId: string;
  followingId: string;
  createdAt: Date;
}
```

#### API設計

```
POST   /api/v1/users/:id/follow         # フォロー
DELETE /api/v1/users/:id/follow         # フォロー解除
GET    /api/v1/users/:id/followers      # フォロワー一覧
GET    /api/v1/users/:id/following      # フォロー中一覧
```

---

## Phase 3: AI・高度機能【4週間】

### 3.1 AI味わいアドバイザー【2週間】

#### 実装フロー

```
1. ユーザー入力
   「苦すぎて、後味が残る」

2. コンテキスト収集
   - 使用レシピ
   - 抽出パラメータ
   - 過去のログ

3. OpenAI API呼び出し
   システムプロンプト + ユーザー入力 + コンテキスト

4. 改善案提示
   「温度を88℃に下げ、挽き目を少し粗くしてみてください」
```

#### API設計

```
POST /api/v1/ai/suggest
{
  "recipeId": "xxx",
  "brewLogId": "xxx",
  "feedback": "苦すぎた"
}

Response:
{
  "suggestions": [
    {
      "parameter": "温度",
      "current": 92,
      "suggested": 88,
      "reason": "苦味を抑えるため"
    }
  ],
  "explanation": "..."
}
```

---

### 3.2 QRコード機能【1週間】

| 機能         | 詳細                                     |
| :----------- | :--------------------------------------- |
| QRコード生成 | レシピをQRコード化してシェア             |
| QRコード読取 | expo-cameraでスキャン → レシピインポート |
| Deep Link    | `coffeehub://recipe/xxx` 形式            |

---

### 3.3 プッシュ通知最適化【1週間】

| 通知種別       | トリガー                         |
| :------------- | :------------------------------- |
| エイジング通知 | 焙煎日から7/10/14日後            |
| 在庫アラート   | 残り50g以下                      |
| フォロワー活動 | フォロー中ユーザーの新レシピ公開 |
| コミュニティ   | 自分のレシピへのいいね/コメント  |

---

## Phase 4: 将来拡張【別途計画】

### 4.1 スマートスケール連携

- Acaia, Hiroia等のBluetooth対応スケール
- リアルタイム重量取得
- 自動抽出ログ記録

### 4.2 EC連携

- Stripe決済
- 焙煎所マーケットプレイス

### 4.3 画像OCR

- 豆パッケージ撮影
- Google Cloud Vision APIで情報抽出

---

## データベーススキーマ

### PostgreSQL（クラウド）

```sql
-- ユーザー
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 豆
CREATE TABLE beans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  roaster_name VARCHAR(255),
  origin VARCHAR(100),
  roast_level VARCHAR(20),
  process VARCHAR(50),
  roast_date DATE,
  stock_grams INTEGER DEFAULT 0,
  flavor_notes TEXT[],
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- レシピ
CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  equipment VARCHAR(50),
  coffee_grams DECIMAL(5,1),
  total_water_ml INTEGER,
  water_temperature INTEGER,
  grind_size VARCHAR(20),
  steps JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 抽出ログ
CREATE TABLE brew_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id),
  bean_id UUID REFERENCES beans(id),
  brew_date TIMESTAMP,
  actual_duration INTEGER,
  rating INTEGER,
  taste_notes JSONB,
  memo TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- フォロー
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- いいね
CREATE TABLE recipe_likes (
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Brewed it!
CREATE TABLE brewed_its (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id),
  rating INTEGER,
  comment TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ディレクトリ構成

### フロントエンド (React Native / Expo)

```
coffee-recipe-hub-app/
├── app.json
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   ├── beans/
│   │   ├── recipes/
│   │   ├── brewing/
│   │   └── community/
│   ├── components/
│   │   ├── common/
│   │   └── ui/
│   ├── hooks/
│   ├── api/
│   ├── store/              # Zustand
│   ├── utils/
│   └── types/
├── assets/
└── package.json
```

### バックエンド (Go)

```
coffee-recipe-hub-api/
├── main.go
├── handlers/
│   ├── auth.go
│   ├── beans.go
│   ├── recipes.go
│   ├── brewing.go
│   ├── community.go
│   └── ai.go
├── models/
├── middleware/
├── database/
├── services/
└── go.mod
```

---

## マイルストーン

| Phase   | 期間       | 完了基準                           |
| :------ | :--------- | :--------------------------------- |
| Phase 1 | Week 1-8   | 豆・レシピ管理、タイマー機能が動作 |
| Phase 2 | Week 9-12  | コミュニティ機能リリース           |
| Phase 3 | Week 13-16 | AI機能、QRコード対応               |
| Phase 4 | 随時       | スマートスケール連携等             |
