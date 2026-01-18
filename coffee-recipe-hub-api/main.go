package main

import (
	"log"
	"os"

	"github.com/coffee-recipe-hub/api/handlers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// .env ファイル読み込み（存在する場合）
	_ = godotenv.Load()

	// Ginルーター初期化
	r := gin.Default()

	// CORS設定
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// ヘルスチェック
	r.GET("/health", handlers.HealthCheck)

	// API v1 ルート
	v1 := r.Group("/api/v1")
	{
		// Beans
		beans := v1.Group("/beans")
		{
			beans.GET("", handlers.GetBeans)
			beans.GET("/:id", handlers.GetBean)
			beans.POST("", handlers.CreateBean)
			beans.PUT("/:id", handlers.UpdateBean)
			beans.DELETE("/:id", handlers.DeleteBean)
		}

		// Recipes
		recipes := v1.Group("/recipes")
		{
			recipes.GET("", handlers.GetRecipes)
			recipes.GET("/:id", handlers.GetRecipe)
			recipes.POST("", handlers.CreateRecipe)
			recipes.PUT("/:id", handlers.UpdateRecipe)
			recipes.DELETE("/:id", handlers.DeleteRecipe)
		}

		// BrewLogs
		brewLogs := v1.Group("/brew-logs")
		{
			brewLogs.GET("", handlers.GetBrewLogs)
			brewLogs.POST("", handlers.CreateBrewLog)
		}
	}

	// ポート設定
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Coffee Recipe Hub API starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
