package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coffee-recipe-hub/api/database"
	"github.com/coffee-recipe-hub/api/models"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
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

	var rows *sql.Rows
	var err error

	if userID == "" {
		rows, err = database.DB.Query(`
			SELECT id, user_id, name, roaster_name, origin, roast_level, process, 
			       roast_date, stock_grams, flavor_notes, created_at, updated_at
			FROM beans ORDER BY created_at DESC
		`)
	} else {
		rows, err = database.DB.Query(`
			SELECT id, user_id, name, roaster_name, origin, roast_level, process,
			       roast_date, stock_grams, flavor_notes, created_at, updated_at
			FROM beans WHERE user_id = $1 ORDER BY created_at DESC
		`, userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var beans []models.Bean
	for rows.Next() {
		var bean models.Bean
		var roastDate sql.NullTime
		err := rows.Scan(
			&bean.ID, &bean.UserID, &bean.Name, &bean.RoasterName, &bean.Origin,
			&bean.RoastLevel, &bean.Process, &roastDate, &bean.StockGrams,
			pq.Array(&bean.FlavorNotes), &bean.CreatedAt, &bean.UpdatedAt,
		)
		if err != nil {
			continue
		}
		if roastDate.Valid {
			bean.RoastDate = roastDate.Time.Format("2006-01-02")
		}
		beans = append(beans, bean)
	}

	if beans == nil {
		beans = []models.Bean{}
	}
	c.JSON(http.StatusOK, beans)
}

// GetBean 豆詳細取得
func GetBean(c *gin.Context) {
	id := c.Param("id")

	var bean models.Bean
	var roastDate sql.NullTime
	err := database.DB.QueryRow(`
		SELECT id, user_id, name, roaster_name, origin, roast_level, process,
		       roast_date, stock_grams, flavor_notes, created_at, updated_at
		FROM beans WHERE id = $1
	`, id).Scan(
		&bean.ID, &bean.UserID, &bean.Name, &bean.RoasterName, &bean.Origin,
		&bean.RoastLevel, &bean.Process, &roastDate, &bean.StockGrams,
		pq.Array(&bean.FlavorNotes), &bean.CreatedAt, &bean.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bean not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if roastDate.Valid {
		bean.RoastDate = roastDate.Time.Format("2006-01-02")
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

	userID := c.GetString("userID")
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000000" // デフォルトユーザー（開発用）
	}

	var bean models.Bean
	var roastDate sql.NullTime
	if req.RoastDate != "" {
		t, _ := time.Parse("2006-01-02", req.RoastDate)
		roastDate = sql.NullTime{Time: t, Valid: true}
	}

	err := database.DB.QueryRow(`
		INSERT INTO beans (user_id, name, roaster_name, origin, roast_level, process, roast_date, stock_grams, flavor_notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, user_id, name, roaster_name, origin, roast_level, process, roast_date, stock_grams, flavor_notes, created_at, updated_at
	`, userID, req.Name, req.RoasterName, req.Origin, req.RoastLevel, req.Process,
		roastDate, req.StockGrams, pq.Array(req.FlavorNotes)).Scan(
		&bean.ID, &bean.UserID, &bean.Name, &bean.RoasterName, &bean.Origin,
		&bean.RoastLevel, &bean.Process, &roastDate, &bean.StockGrams,
		pq.Array(&bean.FlavorNotes), &bean.CreatedAt, &bean.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if roastDate.Valid {
		bean.RoastDate = roastDate.Time.Format("2006-01-02")
	}
	c.JSON(http.StatusCreated, bean)
}

// UpdateBean 豆更新
func UpdateBean(c *gin.Context) {
	id := c.Param("id")

	var req models.CreateBeanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var roastDate sql.NullTime
	if req.RoastDate != "" {
		t, _ := time.Parse("2006-01-02", req.RoastDate)
		roastDate = sql.NullTime{Time: t, Valid: true}
	}

	result, err := database.DB.Exec(`
		UPDATE beans SET name=$1, roaster_name=$2, origin=$3, roast_level=$4, 
		       process=$5, roast_date=$6, stock_grams=$7, flavor_notes=$8, updated_at=NOW()
		WHERE id=$9
	`, req.Name, req.RoasterName, req.Origin, req.RoastLevel, req.Process,
		roastDate, req.StockGrams, pq.Array(req.FlavorNotes), id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bean not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bean updated"})
}

// DeleteBean 豆削除
func DeleteBean(c *gin.Context) {
	id := c.Param("id")

	result, err := database.DB.Exec("DELETE FROM beans WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bean not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bean deleted"})
}

// ========== Recipe Handlers ==========

// GetRecipes レシピ一覧取得
func GetRecipes(c *gin.Context) {
	userID := c.GetString("userID")

	var rows *sql.Rows
	var err error

	if userID == "" {
		rows, err = database.DB.Query(`
			SELECT id, user_id, title, COALESCE(author_name, ''), equipment, coffee_grams, total_water_ml, 
			       water_temperature, grind_size, steps, COALESCE(tags, '{}'), is_public, like_count, created_at, updated_at
			FROM recipes ORDER BY created_at DESC
		`)
	} else {
		rows, err = database.DB.Query(`
			SELECT id, user_id, title, COALESCE(author_name, ''), equipment, coffee_grams, total_water_ml,
			       water_temperature, grind_size, steps, COALESCE(tags, '{}'), is_public, like_count, created_at, updated_at
			FROM recipes WHERE user_id = $1 OR is_public = true ORDER BY created_at DESC
		`, userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var recipes []models.Recipe
	for rows.Next() {
		var recipe models.Recipe
		var stepsJSON []byte
		err := rows.Scan(
			&recipe.ID, &recipe.UserID, &recipe.Title, &recipe.AuthorName,
			&recipe.Equipment, &recipe.CoffeeGrams, &recipe.TotalWaterMl, &recipe.WaterTemperature,
			&recipe.GrindSize, &stepsJSON, pq.Array(&recipe.Tags), &recipe.IsPublic,
			&recipe.LikeCount, &recipe.CreatedAt, &recipe.UpdatedAt,
		)
		if err != nil {
			continue
		}
		json.Unmarshal(stepsJSON, &recipe.Steps)
		recipes = append(recipes, recipe)
	}

	if recipes == nil {
		recipes = []models.Recipe{}
	}
	c.JSON(http.StatusOK, recipes)
}

// GetPublicRecipes 公開レシピ一覧取得（コミュニティ用）
func GetPublicRecipes(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT id, user_id, title, COALESCE(author_name, ''), equipment, coffee_grams, total_water_ml,
		       water_temperature, grind_size, steps, COALESCE(tags, '{}'), is_public, like_count, created_at, updated_at
		FROM recipes WHERE is_public = true ORDER BY like_count DESC, created_at DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var recipes []models.Recipe
	for rows.Next() {
		var recipe models.Recipe
		var stepsJSON []byte
		err := rows.Scan(
			&recipe.ID, &recipe.UserID, &recipe.Title, &recipe.AuthorName,
			&recipe.Equipment, &recipe.CoffeeGrams, &recipe.TotalWaterMl, &recipe.WaterTemperature,
			&recipe.GrindSize, &stepsJSON, pq.Array(&recipe.Tags), &recipe.IsPublic,
			&recipe.LikeCount, &recipe.CreatedAt, &recipe.UpdatedAt,
		)
		if err != nil {
			continue
		}
		json.Unmarshal(stepsJSON, &recipe.Steps)
		recipes = append(recipes, recipe)
	}

	if recipes == nil {
		recipes = []models.Recipe{}
	}
	c.JSON(http.StatusOK, recipes)
}

// GetRecipe レシピ詳細取得
func GetRecipe(c *gin.Context) {
	id := c.Param("id")

	var recipe models.Recipe
	var stepsJSON []byte
	err := database.DB.QueryRow(`
		SELECT id, user_id, title, COALESCE(author_name, ''), equipment, coffee_grams, total_water_ml,
		       water_temperature, grind_size, steps, COALESCE(tags, '{}'), is_public, like_count, created_at, updated_at
		FROM recipes WHERE id = $1
	`, id).Scan(
		&recipe.ID, &recipe.UserID, &recipe.Title, &recipe.AuthorName,
		&recipe.Equipment, &recipe.CoffeeGrams, &recipe.TotalWaterMl, &recipe.WaterTemperature,
		&recipe.GrindSize, &stepsJSON, pq.Array(&recipe.Tags), &recipe.IsPublic,
		&recipe.LikeCount, &recipe.CreatedAt, &recipe.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	json.Unmarshal(stepsJSON, &recipe.Steps)
	c.JSON(http.StatusOK, recipe)
}

// CreateRecipe レシピ作成
func CreateRecipe(c *gin.Context) {
	var req models.CreateRecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userID")
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000000"
	}

	stepsJSON, _ := json.Marshal(req.Steps)

	var recipe models.Recipe
	var stepsBytes []byte
	err := database.DB.QueryRow(`
		INSERT INTO recipes (user_id, title, author_name, equipment, coffee_grams, total_water_ml, water_temperature, grind_size, steps, tags, is_public)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, user_id, title, author_name, equipment, coffee_grams, total_water_ml, water_temperature, grind_size, steps, tags, is_public, like_count, created_at, updated_at
	`, userID, req.Title, req.AuthorName, req.Equipment, req.CoffeeGrams, req.TotalWaterMl,
		req.WaterTemperature, req.GrindSize, stepsJSON, pq.Array(req.Tags), req.IsPublic).Scan(
		&recipe.ID, &recipe.UserID, &recipe.Title, &recipe.AuthorName, &recipe.Equipment,
		&recipe.CoffeeGrams, &recipe.TotalWaterMl, &recipe.WaterTemperature,
		&recipe.GrindSize, &stepsBytes, pq.Array(&recipe.Tags), &recipe.IsPublic, &recipe.LikeCount,
		&recipe.CreatedAt, &recipe.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	json.Unmarshal(stepsBytes, &recipe.Steps)
	c.JSON(http.StatusCreated, recipe)
}

// UpdateRecipe レシピ更新
func UpdateRecipe(c *gin.Context) {
	id := c.Param("id")

	var req models.CreateRecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stepsJSON, _ := json.Marshal(req.Steps)

	result, err := database.DB.Exec(`
		UPDATE recipes SET title=$1, author_name=$2, equipment=$3, coffee_grams=$4, total_water_ml=$5,
		       water_temperature=$6, grind_size=$7, steps=$8, tags=$9, is_public=$10, updated_at=NOW()
		WHERE id=$11
	`, req.Title, req.AuthorName, req.Equipment, req.CoffeeGrams, req.TotalWaterMl,
		req.WaterTemperature, req.GrindSize, stepsJSON, pq.Array(req.Tags), req.IsPublic, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe updated"})
}

// DeleteRecipe レシピ削除
func DeleteRecipe(c *gin.Context) {
	id := c.Param("id")

	result, err := database.DB.Exec("DELETE FROM recipes WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe deleted"})
}

// ========== BrewLog Handlers ==========

// GetBrewLogs 抽出ログ一覧取得
func GetBrewLogs(c *gin.Context) {
	userID := c.GetString("userID")

	var rows *sql.Rows
	var err error

	if userID == "" {
		rows, err = database.DB.Query(`
			SELECT id, user_id, recipe_id, bean_id, brew_date, actual_duration,
			       rating, taste_notes, memo, created_at
			FROM brew_logs ORDER BY brew_date DESC
		`)
	} else {
		rows, err = database.DB.Query(`
			SELECT id, user_id, recipe_id, bean_id, brew_date, actual_duration,
			       rating, taste_notes, memo, created_at
			FROM brew_logs WHERE user_id = $1 ORDER BY brew_date DESC
		`, userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var logs []models.BrewLog
	for rows.Next() {
		var log models.BrewLog
		var recipeID, beanID sql.NullString
		err := rows.Scan(
			&log.ID, &log.UserID, &recipeID, &beanID, &log.BrewDate,
			&log.ActualDuration, &log.Rating, pq.Array(&log.TasteNotes),
			&log.Memo, &log.CreatedAt,
		)
		if err != nil {
			continue
		}
		if recipeID.Valid {
			log.RecipeID = recipeID.String
		}
		if beanID.Valid {
			log.BeanID = beanID.String
		}
		logs = append(logs, log)
	}

	if logs == nil {
		logs = []models.BrewLog{}
	}
	c.JSON(http.StatusOK, logs)
}

// CreateBrewLog 抽出ログ作成
func CreateBrewLog(c *gin.Context) {
	var req models.CreateBrewLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userID")
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000000"
	}

	var recipeID, beanID sql.NullString
	if req.RecipeID != "" {
		recipeID = sql.NullString{String: req.RecipeID, Valid: true}
	}
	if req.BeanID != "" {
		beanID = sql.NullString{String: req.BeanID, Valid: true}
	}

	// トランザクション開始
	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	var log models.BrewLog
	var retRecipeID, retBeanID sql.NullString
	err = tx.QueryRow(`
		INSERT INTO brew_logs (user_id, recipe_id, bean_id, actual_duration, rating, taste_notes, memo)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, recipe_id, bean_id, brew_date, actual_duration, rating, taste_notes, memo, created_at
	`, userID, recipeID, beanID, req.ActualDuration, req.Rating,
		pq.Array(req.TasteNotes), req.Memo).Scan(
		&log.ID, &log.UserID, &retRecipeID, &retBeanID, &log.BrewDate,
		&log.ActualDuration, &log.Rating, pq.Array(&log.TasteNotes),
		&log.Memo, &log.CreatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if retRecipeID.Valid {
		log.RecipeID = retRecipeID.String
	}
	if retBeanID.Valid {
		log.BeanID = retBeanID.String
	}

	// 在庫を減らす処理
	if req.RecipeID != "" && req.BeanID != "" {
		var coffeeGrams float64
		err = tx.QueryRow("SELECT coffee_grams FROM recipes WHERE id = $1", req.RecipeID).Scan(&coffeeGrams)
		if err == nil {
			// レシピが見つかった場合のみ在庫を減らす
			_, err = tx.Exec(`
				UPDATE beans 
				SET stock_grams = GREATEST(stock_grams - $1, 0), updated_at = NOW() 
				WHERE id = $2
			`, coffeeGrams, req.BeanID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bean stock"})
				return
			}
		} else if err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recipe"})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, log)
}
