package handlers

import (
	"net/http"
	"time"

	"github.com/coffee-recipe-hub/api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// インメモリデータストア（開発用）
var (
	beans    = make(map[string]models.Bean)
	recipes  = make(map[string]models.Recipe)
	brewLogs = make(map[string]models.BrewLog)
)

// HealthCheck ヘルスチェック
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Coffee Recipe Hub API is running",
	})
}

// ========== Bean Handlers ==========

// GetBeans 豆一覧取得
func GetBeans(c *gin.Context) {
	userID := c.GetString("userID")
	var userBeans []models.Bean
	for _, bean := range beans {
		if bean.UserID == userID || userID == "" {
			userBeans = append(userBeans, bean)
		}
	}
	c.JSON(http.StatusOK, userBeans)
}

// GetBean 豆詳細取得
func GetBean(c *gin.Context) {
	id := c.Param("id")
	bean, exists := beans[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bean not found"})
		return
	}
	c.JSON(http.StatusOK, bean)
}

// CreateBean 豆作成
func CreateBean(c *gin.Context) {
	var req models.CreateBeanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bean := models.Bean{
		ID:          uuid.New().String(),
		UserID:      c.GetString("userID"),
		Name:        req.Name,
		RoasterName: req.RoasterName,
		Origin:      req.Origin,
		RoastLevel:  req.RoastLevel,
		Process:     req.Process,
		RoastDate:   req.RoastDate,
		StockGrams:  req.StockGrams,
		FlavorNotes: req.FlavorNotes,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	beans[bean.ID] = bean
	c.JSON(http.StatusCreated, bean)
}

// UpdateBean 豆更新
func UpdateBean(c *gin.Context) {
	id := c.Param("id")
	bean, exists := beans[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bean not found"})
		return
	}

	var req models.CreateBeanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bean.Name = req.Name
	bean.RoasterName = req.RoasterName
	bean.Origin = req.Origin
	bean.RoastLevel = req.RoastLevel
	bean.Process = req.Process
	bean.RoastDate = req.RoastDate
	bean.StockGrams = req.StockGrams
	bean.FlavorNotes = req.FlavorNotes
	bean.UpdatedAt = time.Now()

	beans[id] = bean
	c.JSON(http.StatusOK, bean)
}

// DeleteBean 豆削除
func DeleteBean(c *gin.Context) {
	id := c.Param("id")
	if _, exists := beans[id]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bean not found"})
		return
	}
	delete(beans, id)
	c.JSON(http.StatusOK, gin.H{"message": "Bean deleted"})
}

// ========== Recipe Handlers ==========

// GetRecipes レシピ一覧取得
func GetRecipes(c *gin.Context) {
	userID := c.GetString("userID")
	var userRecipes []models.Recipe
	for _, recipe := range recipes {
		if recipe.UserID == userID || userID == "" {
			userRecipes = append(userRecipes, recipe)
		}
	}
	c.JSON(http.StatusOK, userRecipes)
}

// GetRecipe レシピ詳細取得
func GetRecipe(c *gin.Context) {
	id := c.Param("id")
	recipe, exists := recipes[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}
	c.JSON(http.StatusOK, recipe)
}

// CreateRecipe レシピ作成
func CreateRecipe(c *gin.Context) {
	var req models.CreateRecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipe := models.Recipe{
		ID:               uuid.New().String(),
		UserID:           c.GetString("userID"),
		Title:            req.Title,
		Equipment:        req.Equipment,
		CoffeeGrams:      req.CoffeeGrams,
		TotalWaterMl:     req.TotalWaterMl,
		WaterTemperature: req.WaterTemperature,
		GrindSize:        req.GrindSize,
		Steps:            req.Steps,
		IsPublic:         req.IsPublic,
		LikeCount:        0,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	recipes[recipe.ID] = recipe
	c.JSON(http.StatusCreated, recipe)
}

// UpdateRecipe レシピ更新
func UpdateRecipe(c *gin.Context) {
	id := c.Param("id")
	recipe, exists := recipes[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}

	var req models.CreateRecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipe.Title = req.Title
	recipe.Equipment = req.Equipment
	recipe.CoffeeGrams = req.CoffeeGrams
	recipe.TotalWaterMl = req.TotalWaterMl
	recipe.WaterTemperature = req.WaterTemperature
	recipe.GrindSize = req.GrindSize
	recipe.Steps = req.Steps
	recipe.IsPublic = req.IsPublic
	recipe.UpdatedAt = time.Now()

	recipes[id] = recipe
	c.JSON(http.StatusOK, recipe)
}

// DeleteRecipe レシピ削除
func DeleteRecipe(c *gin.Context) {
	id := c.Param("id")
	if _, exists := recipes[id]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}
	delete(recipes, id)
	c.JSON(http.StatusOK, gin.H{"message": "Recipe deleted"})
}

// ========== BrewLog Handlers ==========

// GetBrewLogs 抽出ログ一覧取得
func GetBrewLogs(c *gin.Context) {
	userID := c.GetString("userID")
	var userLogs []models.BrewLog
	for _, log := range brewLogs {
		if log.UserID == userID || userID == "" {
			userLogs = append(userLogs, log)
		}
	}
	c.JSON(http.StatusOK, userLogs)
}

// CreateBrewLog 抽出ログ作成
func CreateBrewLog(c *gin.Context) {
	var req models.CreateBrewLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log := models.BrewLog{
		ID:             uuid.New().String(),
		UserID:         c.GetString("userID"),
		RecipeID:       req.RecipeID,
		BeanID:         req.BeanID,
		BrewDate:       time.Now(),
		ActualDuration: req.ActualDuration,
		Rating:         req.Rating,
		TasteNotes:     req.TasteNotes,
		Memo:           req.Memo,
		CreatedAt:      time.Now(),
	}

	brewLogs[log.ID] = log
	c.JSON(http.StatusCreated, log)
}
