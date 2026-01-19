package main

import (
	"log"
	"os"
	"strings"

	"github.com/coffee-recipe-hub/api/database"
	"github.com/coffee-recipe-hub/api/handlers"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

func main() {
	// .env ファイル読み込み
	_ = godotenv.Load()

	// データベース接続
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

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

	// 認証ミドルウェア
	r.Use(AuthMiddleware())

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
			recipes.GET("/public", handlers.GetPublicRecipes) // 公開レシピ一覧
			recipes.GET("/:id", handlers.GetRecipe)
			recipes.POST("", handlers.CreateRecipe)
			recipes.PUT("/:id", handlers.UpdateRecipe)
			recipes.DELETE("/:id", handlers.DeleteRecipe)
			// いいね機能
			recipes.POST("/:id/like", handlers.LikeRecipe)
			recipes.DELETE("/:id/like", handlers.UnlikeRecipe)
			recipes.GET("/:id/like", handlers.CheckLikeStatus)
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

// AuthMiddleware JWTトークンからユーザーIDを抽出するミドルウェア
func AuthMiddleware() gin.HandlerFunc {
	jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		tokenString := parts[1]

		var token *jwt.Token
		var err error

		if jwtSecret != "" {
			// 本番モード: JWT署名を検証
			token, err = jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(jwtSecret), nil
			})
			if err != nil {
				log.Printf("Failed to verify token: %v", err)
				c.Next()
				return
			}
		} else {
			// 開発モード: 署名検証なし（警告ログ）
			log.Println("⚠️  WARNING: SUPABASE_JWT_SECRET not set, skipping signature verification")
			token, _, err = new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
			if err != nil {
				log.Printf("Failed to parse token: %v", err)
				c.Next()
				return
			}
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if sub, ok := claims["sub"].(string); ok {
				c.Set("userID", sub)
			}
		}

		c.Next()
	}
}
