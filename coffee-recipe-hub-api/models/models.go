package models

import "time"

// RoastLevel 焙煎度
type RoastLevel string

const (
	RoastLevelLight       RoastLevel = "LIGHT"
	RoastLevelMediumLight RoastLevel = "MEDIUM_LIGHT"
	RoastLevelMedium      RoastLevel = "MEDIUM"
	RoastLevelMediumDark  RoastLevel = "MEDIUM_DARK"
	RoastLevelDark        RoastLevel = "DARK"
)

// GrindSize 挽き目
type GrindSize string

const (
	GrindSizeExtraFine   GrindSize = "EXTRA_FINE"
	GrindSizeFine        GrindSize = "FINE"
	GrindSizeMediumFine  GrindSize = "MEDIUM_FINE"
	GrindSizeMedium      GrindSize = "MEDIUM"
	GrindSizeMediumCoarse GrindSize = "MEDIUM_COARSE"
	GrindSizeCoarse      GrindSize = "COARSE"
)

// Equipment 抽出器具
type Equipment string

const (
	EquipmentV60         Equipment = "V60"
	EquipmentKalitaWave  Equipment = "KALITA_WAVE"
	EquipmentChemex      Equipment = "CHEMEX"
	EquipmentAeropress   Equipment = "AEROPRESS"
	EquipmentFrenchPress Equipment = "FRENCH_PRESS"
	EquipmentClever      Equipment = "CLEVER"
	EquipmentOther       Equipment = "OTHER"
)

// User ユーザー
type User struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	DisplayName string    `json:"displayName"`
	AvatarURL   string    `json:"avatarUrl,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

// Bean コーヒー豆
type Bean struct {
	ID           string     `json:"id"`
	UserID       string     `json:"userId"`
	Name         string     `json:"name"`
	RoasterName  string     `json:"roasterName"`
	Origin       string     `json:"origin"`
	RoastLevel   RoastLevel `json:"roastLevel"`
	Process      string     `json:"process"`
	RoastDate    string     `json:"roastDate"`
	StockGrams   int        `json:"stockGrams"`
	FlavorNotes  []string   `json:"flavorNotes"`
	ImageURL     string     `json:"imageUrl,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

// RecipeStep レシピステップ
type RecipeStep struct {
	Order      int    `json:"order"`
	Label      string `json:"label"`
	TimeSeconds int   `json:"timeSeconds"`
	WaterMl    int    `json:"waterMl"`
	Notes      string `json:"notes,omitempty"`
}

// Recipe レシピ
type Recipe struct {
	ID               string       `json:"id"`
	UserID           string       `json:"userId"`
	Title            string       `json:"title"`
	Equipment        Equipment    `json:"equipment"`
	CoffeeGrams      float64      `json:"coffeeGrams"`
	TotalWaterMl     int          `json:"totalWaterMl"`
	WaterTemperature int          `json:"waterTemperature"`
	GrindSize        GrindSize    `json:"grindSize"`
	Steps            []RecipeStep `json:"steps"`
	IsPublic         bool         `json:"isPublic"`
	LikeCount        int          `json:"likeCount"`
	CreatedAt        time.Time    `json:"createdAt"`
	UpdatedAt        time.Time    `json:"updatedAt"`
}

// TasteNote 味の評価
type TasteNote struct {
	Aspect string `json:"aspect"` // acidity, bitterness, sweetness, body, aftertaste
	Score  int    `json:"score"`  // 1-5
}

// BrewLog 抽出ログ
type BrewLog struct {
	ID             string      `json:"id"`
	UserID         string      `json:"userId"`
	RecipeID       string      `json:"recipeId"`
	BeanID         string      `json:"beanId"`
	BrewDate       time.Time   `json:"brewDate"`
	ActualDuration int         `json:"actualDuration"` // 秒
	Rating         int         `json:"rating"`         // 1-5
	TasteNotes     []TasteNote `json:"tasteNotes"`
	Memo           string      `json:"memo,omitempty"`
	CreatedAt      time.Time   `json:"createdAt"`
}

// CreateBeanRequest 豆作成リクエスト
type CreateBeanRequest struct {
	Name         string     `json:"name" binding:"required"`
	RoasterName  string     `json:"roasterName"`
	Origin       string     `json:"origin"`
	RoastLevel   RoastLevel `json:"roastLevel"`
	Process      string     `json:"process"`
	RoastDate    string     `json:"roastDate"`
	StockGrams   int        `json:"stockGrams"`
	FlavorNotes  []string   `json:"flavorNotes"`
}

// CreateRecipeRequest レシピ作成リクエスト
type CreateRecipeRequest struct {
	Title            string       `json:"title" binding:"required"`
	Equipment        Equipment    `json:"equipment" binding:"required"`
	CoffeeGrams      float64      `json:"coffeeGrams" binding:"required"`
	TotalWaterMl     int          `json:"totalWaterMl" binding:"required"`
	WaterTemperature int          `json:"waterTemperature"`
	GrindSize        GrindSize    `json:"grindSize"`
	Steps            []RecipeStep `json:"steps"`
	IsPublic         bool         `json:"isPublic"`
}

// CreateBrewLogRequest 抽出ログ作成リクエスト
type CreateBrewLogRequest struct {
	RecipeID       string      `json:"recipeId" binding:"required"`
	BeanID         string      `json:"beanId" binding:"required"`
	ActualDuration int         `json:"actualDuration"`
	Rating         int         `json:"rating" binding:"required,min=1,max=5"`
	TasteNotes     []TasteNote `json:"tasteNotes"`
	Memo           string      `json:"memo"`
}
