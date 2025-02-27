package api

import (
	"encoding/json"
	"log"
	"os"
	"strings"

	"github.com/exil0867/go-trena/api/models"
	"github.com/exil0867/go-trena/db"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	gotrueTypes "github.com/supabase-community/gotrue-go/types"
	postgrest "github.com/supabase-community/postgrest-go"
)

func GetUsers(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("users").Select("*", "exact", false).Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to retrieve users: " + err.Error())
	}

	var users []models.User
	if err := json.Unmarshal(data, &users); err != nil {
		return c.Status(500).SendString("Failed to parse user data: " + err.Error())
	}

	return c.JSON(users)
}

func CreateActivity(c fiber.Ctx) error {
	var activity models.Activity
	if err := c.Bind().Body(&activity); err != nil {
		return c.Status(400).SendString("Invalid activity payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("activities").Insert(activity, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Could not create activity: " + err.Error())
	}

	var result []models.Activity
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created activity data: " + err.Error())
	}

	return c.JSON(result)
}

func GetActivities(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("activities").Select("*", "exact", false).Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve activities: " + err.Error())
	}

	var activities []models.Activity
	if err := json.Unmarshal(data, &activities); err != nil {
		return c.Status(500).SendString("Failed to parse activities data: " + err.Error())
	}

	return c.JSON(activities)
}

func AddUserActivity(c fiber.Ctx) error {
	var ua models.UserActivity
	if err := c.Bind().Body(&ua); err != nil {
		return c.Status(400).SendString("Invalid user activity payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("user_activities").Insert(ua, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to add activity to user: " + err.Error())
	}

	var result []models.UserActivity
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse added user activity data: " + err.Error())
	}

	return c.JSON(result)
}

func GetUserActivities(c fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["sub"].(string)

	log.Printf("here: %s\n", userID)

	data, _, err := db.Supabase.From("user_activities").
		Select("id, created_at, activities(id, name, description)", "exact", false).
		Eq("user_id", userID).
		Execute()

	if err != nil {
		return c.Status(500).SendString("Could not retrieve user activities: " + err.Error())
	}

	var activities []map[string]interface{}
	if err := json.Unmarshal(data, &activities); err != nil {
		return c.Status(500).SendString("Failed to parse user activities data: " + err.Error())
	}

	return c.JSON(activities)
}

func CreatePlan(c fiber.Ctx) error {
	var plan models.PlanInsert
	if err := c.Bind().Body(&plan); err != nil {
		return c.Status(400).SendString("Invalid plan payload: " + err.Error())
	}
	log.Println("here:", plan)

	data, _, err := db.Supabase.From("plans").Insert(plan, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Could not create plan: " + err.Error())
	}

	var result []models.Plan
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created plan data: " + err.Error())
	}

	return c.JSON(result)
}

func GetPlan(c fiber.Ctx) error {
	planID := c.Params("id")
	data, _, err := db.Supabase.From("plans").Select("*", "exact", false).Eq("id", planID).Execute()
	if err != nil {
		return c.Status(404).SendString("Plan not found: " + err.Error())
	}

	var plans []models.Plan
	if err := json.Unmarshal(data, &plans); err != nil {
		return c.Status(500).SendString("Failed to parse plan data: " + err.Error())
	}

	if len(plans) == 0 {
		return c.Status(404).SendString("Plan not found")
	}

	return c.JSON(plans[0])
}

func GetPlans(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("plans").Select("*", "exact", false).Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve plans: " + err.Error())
	}

	var plans []models.Activity
	if err := json.Unmarshal(data, &plans); err != nil {
		return c.Status(500).SendString("Failed to parse plans data: " + err.Error())
	}

	return c.JSON(plans)
}

func CreateExerciseGroup(c fiber.Ctx) error {
	var group models.ExerciseGroup
	if err := c.Bind().Body(&group); err != nil {
		return c.Status(400).SendString("Invalid exercise group payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("exercise_groups").Insert(group, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Could not create exercise group: " + err.Error())
	}

	var result []models.ExerciseGroup
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created group data: " + err.Error())
	}

	return c.JSON(result)
}

func GetExerciseGroupsByPlan(c fiber.Ctx) error {
	planID := c.Params("plan_id")
	data, _, err := db.Supabase.From("exercise_groups").
		Select("*", "exact", false).
		Eq("plan_id", planID).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve exercise groups: " + err.Error())
	}

	var groups []models.ExerciseGroup
	if err := json.Unmarshal(data, &groups); err != nil {
		return c.Status(500).SendString("Failed to parse exercise groups data: " + err.Error())
	}

	return c.JSON(groups)
}

func CreateExercise(c fiber.Ctx) error {
	var exercise models.Exercise
	if err := c.Bind().Body(&exercise); err != nil {
		return c.Status(400).SendString("Invalid exercise payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("exercises").Insert(exercise, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Could not create exercise: " + err.Error())
	}

	var result []models.Exercise
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created exercise data: " + err.Error())
	}

	return c.JSON(result)
}

func GetExercisesByGroup(c fiber.Ctx) error {
	groupId := c.Params("group_id")
	data, _, err := db.Supabase.From("exercises").
		Select("*", "exact", false).
		Eq("exercise_group_id", groupId).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve exercises: " + err.Error())
	}

	var exercises []models.Exercise
	if err := json.Unmarshal(data, &exercises); err != nil {
		return c.Status(500).SendString("Failed to parse exercises data: " + err.Error())
	}

	return c.JSON(exercises)
}

func GetExerciseCategories(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("exercise_categories").
		Select("*", "exact", false).
		Execute()

	if err != nil {
		return c.Status(500).SendString("Failed to retrieve exercise categories: " + err.Error())
	}

	var categories []models.ExerciseCategory
	if err := json.Unmarshal(data, &categories); err != nil {
		return c.Status(500).SendString("Failed to parse exercise categories: " + err.Error())
	}

	return c.JSON(categories)
}

func CreateExerciseCategory(c fiber.Ctx) error {
	var category models.ExerciseCategory
	if err := c.Bind().Body(&category); err != nil {
		return c.Status(400).SendString("Invalid category payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("exercise_categories").
		Insert(category, false, "", "representation", "").
		Execute()

	if err != nil {
		return c.Status(500).SendString("Could not create exercise category: " + err.Error())
	}

	var result []models.ExerciseCategory
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created category data: " + err.Error())
	}

	return c.JSON(result)
}

func LogExercise(c fiber.Ctx) error {
	var logEntry models.ExerciseLog
	if err := c.Bind().Body(&logEntry); err != nil {
		return c.Status(400).SendString("Invalid exercise log payload: " + err.Error())
	}

	// if logEntry.ExerciseID == "" || logEntry.UserID == "" || logEntry.Date == "" {
	// 	return c.Status(400).SendString("Missing required fields")
	// }

	data, _, err := db.Supabase.From("exercise_logs").Insert(logEntry, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to log exercise: " + err.Error())
	}

	var result []models.ExerciseLog
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse logged exercise data: " + err.Error())
	}

	return c.JSON(result)
}

func GetExerciseLogsByUser(c fiber.Ctx) error {
	userID := c.Params("user_id")
	data, _, err := db.Supabase.From("exercise_logs").
		Select("*", "exact", false).
		Eq("user_id", userID).
		Order("date", &postgrest.OrderOpts{Ascending: false}).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve exercise logs: " + err.Error())
	}

	var logs []models.ExerciseLog
	if err := json.Unmarshal(data, &logs); err != nil {
		return c.Status(500).SendString("Failed to parse exercise logs data: " + err.Error())
	}

	return c.JSON(logs)
}

func AuthMiddleware(c fiber.Ctx) error {
	// Exclude some paths from authentication
	excludedPaths := []string{"/auth/signup", "/auth/login", "/auth/refresh", "/auth/user"}

	// Check if the request path is in the excluded list
	for _, path := range excludedPaths {
		if c.Path() == path {
			return c.Next() // Skip the authentication middleware
		}
	}

	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("SUPABASE_JWT_SECRET")), nil
	})

	if err != nil {
		log.Println("Error parsing token:", err)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
	}

	if !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		log.Println("Error casting claims to MapClaims")
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	if _, exists := claims["email"]; !exists {
		log.Println("Email claim is missing")
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	c.Locals("user", claims)
	return c.Next()
}

// Sign up with email/password
func SignUp(c fiber.Ctx) error {
	type Credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var creds Credentials
	if err := c.Bind().Body(&creds); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	body := gotrueTypes.SignupRequest{
		Email:    creds.Email,
		Password: creds.Password,
	}

	// Call the Signup method correctly
	session, err := db.Supabase.Auth.Signup(body)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Signup failed", "details": err.Error()})
	}

	return c.JSON(fiber.Map{"session": session})
}

// Sign in with email/password
func SignIn(c fiber.Ctx) error {
	type Credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var creds Credentials
	if err := c.Bind().Body(&creds); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	session, err := db.Supabase.SignInWithEmailPassword(creds.Email, creds.Password)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Login failed", "details": err.Error()})
	}

	return c.JSON(fiber.Map{
		"access_token":  session.AccessToken,
		"refresh_token": session.RefreshToken,
		"expires_in":    session.ExpiresIn,
	})
}

// Refresh token
func RefreshToken(c fiber.Ctx) error {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token"`
	}

	var req RefreshRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	newSession, err := db.Supabase.RefreshToken(req.RefreshToken)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Token refresh failed"})
	}

	return c.JSON(fiber.Map{
		"access_token":  newSession.AccessToken,
		"refresh_token": newSession.RefreshToken,
		"expires_in":    newSession.ExpiresIn,
	})
}

// Get current user
func GetCurrentUser(c fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	return c.JSON(fiber.Map{
		"id":    claims["sub"],
		"email": claims["email"],
		"role":  claims["role"],
	})
}
