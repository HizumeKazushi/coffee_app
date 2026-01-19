-- Coffee Recipe Hub データベーススキーマ
-- Supabase SQL Editorで実行してください

-- 豆テーブル
CREATE TABLE IF NOT EXISTS beans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    roaster_name VARCHAR(255),
    origin VARCHAR(255),
    roast_level VARCHAR(50),
    process VARCHAR(255),
    roast_date DATE,
    stock_grams INTEGER DEFAULT 0,
    flavor_notes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- レシピテーブル
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author_name VARCHAR(255),
    equipment VARCHAR(50),
    coffee_grams DECIMAL(5,1),
    total_water_ml INTEGER,
    water_temperature INTEGER,
    grind_size VARCHAR(50),
    steps JSONB,
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 抽出ログテーブル
CREATE TABLE IF NOT EXISTS brew_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    bean_id UUID REFERENCES beans(id) ON DELETE SET NULL,
    brew_date TIMESTAMPTZ DEFAULT NOW(),
    actual_duration INTEGER,
    rating INTEGER CHECK (rating >= 0 AND rating <= 5),
    taste_notes TEXT[],
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_beans_user_id ON beans(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_brew_logs_user_id ON brew_logs(user_id);

-- RLS (Row Level Security) ポリシー
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE brew_logs ENABLE ROW LEVEL SECURITY;

-- 豆: ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own beans" ON beans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own beans" ON beans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own beans" ON beans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own beans" ON beans FOR DELETE USING (auth.uid() = user_id);

-- レシピ: 自分のデータ + 公開レシピを閲覧可能
CREATE POLICY "Users can view own and public recipes" ON recipes FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- 抽出ログ: ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own brew_logs" ON brew_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brew_logs" ON brew_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brew_logs" ON brew_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brew_logs" ON brew_logs FOR DELETE USING (auth.uid() = user_id);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS recipe_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_likes_user_id ON recipe_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_id ON recipe_likes(recipe_id);

ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

-- いいね: ユーザーは自分のいいねのみ管理可能、閲覧は全員可能
CREATE POLICY "Users can view all likes" ON recipe_likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own likes" ON recipe_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON recipe_likes FOR DELETE USING (auth.uid() = user_id);
