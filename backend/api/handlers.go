package api

import (
	"encoding/json"
	"log"
	"os"
	"strings"
	"time"

	"github.com/exil0867/go-trena/api/models"
	"github.com/exil0867/go-trena/db"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	gotrueTypes "github.com/supabase-community/gotrue-go/types"
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

	// Get the "activity_id" query parameter (if any)
	activityID := c.Params("activity_id")

	log.Printf("User ID: %s, Activity ID: %s\n", userID, activityID)

	// Start building the query
	query := db.Supabase.From("user_activities").
		Select("id, created_at, activities(id, name, description)", "exact", false).
		Eq("user_id", userID)

	// Apply filtering if activity_id is provided
	if activityID != "" {
		query = query.Eq("activity_id", activityID)
	}

	// Execute the query
	data, _, err := query.Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve user activities: " + err.Error())
	}

	// Parse JSON response
	var activities []map[string]interface{}
	if err := json.Unmarshal(data, &activities); err != nil {
		return c.Status(500).SendString("Failed to parse user activities data: " + err.Error())
	}

	return c.JSON(activities)
}

func CreatePlan(c fiber.Ctx) error {
	var plan models.UpsertPlan
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
	activityId := c.Params("user_activity_id")

	// Start building the query
	query := db.Supabase.From("plans").
		Select("*", "exact", false)

	// Apply filtering if activity_id is provided
	if activityId != "" {
		query = query.Eq("activity_id", activityId)
	}

	// Execute the query
	data, _, err := query.Execute()

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
	var group models.UpsertExerciseGroup
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

func AddExerciseToGroup(c fiber.Ctx) error {
	var exerciseGroup models.ExerciseGroupExercise
	if err := c.Bind().Body(&exerciseGroup); err != nil {
		return c.Status(400).SendString("Invalid exercise group payload: " + err.Error())
	}

	// Check if exercise group exists
	groupData, _, err := db.Supabase.From("exercise_groups").
		Select("id, name", "exact", false).
		Eq("id", exerciseGroup.ExerciseGroupID.String()).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to check if exercise group exists: " + err.Error())
	}

	var groups []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	if err := json.Unmarshal(groupData, &groups); err != nil {
		return c.Status(500).SendString("Failed to parse exercise group data: " + err.Error())
	}

	if len(groups) == 0 {
		return c.Status(404).SendString("Exercise group not found")
	}
	groupName := groups[0].Name

	// Check if exercise exists
	exerciseData, _, err := db.Supabase.From("exercises").
		Select("id, name, description", "exact", false).
		Eq("id", exerciseGroup.ExerciseID.String()).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to check if exercise exists: " + err.Error())
	}

	var exercises []struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.Unmarshal(exerciseData, &exercises); err != nil {
		return c.Status(500).SendString("Failed to parse exercise data: " + err.Error())
	}

	if len(exercises) == 0 {
		return c.Status(404).SendString("Exercise not found")
	}
	exercise := exercises[0]

	// Insert the exercise to group
	_, _, err = db.Supabase.From("exercise_group_exercises").
		Insert(exerciseGroup, false, "", "representation", "").
		Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to add exercise to group: " + err.Error())
	}

	// Prepare the response as a single object (not an array)
	response := struct {
		ExerciseGroupID string `json:"exercise_group_id"`
		GroupName       string `json:"group_name"`
		Exercise        struct {
			ID          string `json:"id"`
			Name        string `json:"name"`
			Description string `json:"description"`
		} `json:"exercise"`
	}{
		ExerciseGroupID: exerciseGroup.ExerciseGroupID.String(),
		GroupName:       groupName,
		Exercise: struct {
			ID          string `json:"id"`
			Name        string `json:"name"`
			Description string `json:"description"`
		}{
			ID:          exercise.ID,
			Name:        exercise.Name,
			Description: exercise.Description,
		},
	}

	// Return the response as a single JSON object
	return c.JSON(response)
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
	var exercise models.UpsertExercise
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
	groupID := c.Params("group_id")
	log.Printf("Fetching exercises for group ID: %s\n", groupID)

	// Verify the group exists
	groupData, _, err := db.Supabase.From("exercise_groups").
		Select("id, name", "exact", false).
		Eq("id", groupID).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to verify exercise group: " + err.Error())
	}

	// Parse group data
	var groups []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	if err := json.Unmarshal(groupData, &groups); err != nil {
		return c.Status(500).SendString("Failed to parse group data: " + err.Error())
	}

	// If no group found, return 404
	if len(groups) == 0 {
		return c.Status(404).SendString("Exercise group not found")
	}

	// Group exists, now fetch exercises
	data, _, err := db.Supabase.From("exercise_group_exercises").
		Select("exercise_group_id, exercise_id, exercises(id, name, description, tracking_type)", "exact", false).
		Eq("exercise_group_id", groupID).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to fetch exercises: " + err.Error())
	}

	// Parse group UUID
	groupUUID, err := uuid.Parse(groupID)
	if err != nil {
		return c.Status(400).SendString("Invalid group ID format")
	}

	response := models.GroupExercisesResponse{
		ExerciseGroupID: groupUUID,
		GroupName:       groups[0].Name,
		Exercises:       []models.Exercise{},
	}

	// If there are no exercises, we'll still return the group with empty exercises array
	if len(data) > 0 {
		// Custom struct to handle the joined data from Supabase
		type JoinResult struct {
			ExerciseGroupID string `json:"exercise_group_id"`
			ExerciseID      string `json:"exercise_id"`
			Exercises       struct {
				ID           string `json:"id"`
				Name         string `json:"name"`
				TrackingType string `json:"tracking_type"`
				Description  string `json:"description"`
			} `json:"exercises"`
		}

		// Parse JSON response for exercises
		var joinResults []JoinResult
		if err := json.Unmarshal(data, &joinResults); err != nil {
			return c.Status(500).SendString("Failed to parse exercise data: " + err.Error())
		}

		// Convert each exercise to our Exercise model
		for _, result := range joinResults {
			exerciseID, err := uuid.Parse(result.ExerciseID)
			if err != nil {
				continue // Skip invalid IDs
			}

			exercise := models.Exercise{
				ID:           exerciseID,
				Name:         result.Exercises.Name,
				TrackingType: result.Exercises.TrackingType,
				Description:  result.Exercises.Description,
			}
			response.Exercises = append(response.Exercises, exercise)
		}
	}

	return c.JSON(response)
}

func LogExercise(c fiber.Ctx) error {
	var logEntry models.UpsertExerciseLog
	if err := c.Bind().Body(&logEntry); err != nil {
		return c.Status(400).SendString("Invalid exercise log payload: " + err.Error())
	}

	// First, fetch the full exercise details
	exerciseData, _, err := db.Supabase.From("exercises").
		Select("id, name, tracking_type, description", "exact", false).
		Eq("id", logEntry.ExerciseID.String()).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to fetch exercise details: " + err.Error())
	}

	var exercises []struct {
		ID           string `json:"id"`
		Name         string `json:"name"`
		TrackingType string `json:"tracking_type"`
		Description  string `json:"description"`
	}
	if err := json.Unmarshal(exerciseData, &exercises); err != nil {
		return c.Status(500).SendString("Failed to parse exercise data: " + err.Error())
	}

	if len(exercises) == 0 {
		return c.Status(404).SendString("Exercise not found")
	}
	exercise := exercises[0]

	// Insert the exercise log
	data, _, err := db.Supabase.From("exercise_logs").Insert(logEntry, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to log exercise: " + err.Error())
	}

	var result []models.ExerciseLog
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse logged exercise data: " + err.Error())
	}

	// Prepare the response with full exercise details
	response := struct {
		ID         string                 `json:"id"`
		UserID     uuid.UUID              `json:"user_id"`
		Metrics    map[string]interface{} `json:"metrics"`
		CreatedAt  string                 `json:"created_at"`
		ExerciseID uuid.UUID              `json:"exercise_id"`
		Exercise   struct {
			ID           string `json:"id"`
			Name         string `json:"name"`
			TrackingType string `json:"tracking_type"`
			Description  string `json:"description"`
		} `json:"exercise"`
	}{
		ID:         result[0].ID.String(),
		UserID:     result[0].UserID,
		Metrics:    result[0].Metrics,
		CreatedAt:  result[0].CreatedAt,
		ExerciseID: result[0].ExerciseID,
		Exercise: struct {
			ID           string `json:"id"`
			Name         string `json:"name"`
			TrackingType string `json:"tracking_type"`
			Description  string `json:"description"`
		}{
			ID:           exercise.ID,
			Name:         exercise.Name,
			TrackingType: exercise.TrackingType,
			Description:  exercise.Description,
		},
	}

	return c.JSON(response)
}

func GetExerciseLogsByUser(c fiber.Ctx) error {
	userID := c.Params("user_id")

	// Use a join query to fetch exercise logs with exercise details
	data, _, err := db.Supabase.From("exercise_logs").
		Select("*, exercise:exercise_id(id, name, description, tracking_type)", "exact", false).
		Eq("user_id", userID).
		Execute()

	if err != nil {
		return c.Status(500).SendString("Could not retrieve exercise logs: " + err.Error())
	}

	// Parse into maps first for more flexible handling
	var rawLogs []map[string]interface{}
	if err := json.Unmarshal(data, &rawLogs); err != nil {
		return c.Status(500).SendString("Failed to parse raw exercise logs data: " + err.Error())
	}

	// Create a custom response structure with exercise details
	type ExerciseDetails struct {
		ID           string `json:"id"`
		Name         string `json:"name"`
		TrackingType string `json:"tracking_type"`
		Description  string `json:"description"`
	}

	type LogWithExercise struct {
		ID         string                 `json:"id"`
		UserID     string                 `json:"user_id"`
		Metrics    map[string]interface{} `json:"metrics"`
		CreatedAt  string                 `json:"created_at"`
		ExerciseID string                 `json:"exercise_id"`
		Exercise   ExerciseDetails        `json:"exercise"`
	}

	var response []LogWithExercise

	for _, rawLog := range rawLogs {
		log := LogWithExercise{
			ID:         getString(rawLog, "id"),
			UserID:     getString(rawLog, "user_id"),
			ExerciseID: getString(rawLog, "exercise_id"),

			// Handle metrics
			Metrics: getMetrics(rawLog),

			// Handle created_at
			CreatedAt: getString(rawLog, "created_at"),
		}

		// Extract exercise details from the nested object
		if exerciseData, ok := rawLog["exercise"].(map[string]interface{}); ok {
			log.Exercise = ExerciseDetails{
				ID:           getString(exerciseData, "id"),
				Name:         getString(exerciseData, "name"),
				TrackingType: getString(exerciseData, "tracking_type"),
				Description:  getString(exerciseData, "description"),
			}
		}

		response = append(response, log)
	}

	return c.JSON(response)
}

// Helper function to safely get string values from map
func getString(data map[string]interface{}, key string) string {
	if val, ok := data[key].(string); ok {
		return val
	}
	return ""
}

// Helper function to format date if needed
func formatDate(dateStr string) string {
	// Parse and reformat the date if needed
	if dateStr == "" {
		return ""
	}

	// Try parsing with different formats
	formats := []string{
		"2006-01-02",
		"2006-01-02T15:04:05.999999",
		time.RFC3339,
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			// Format as YYYY-MM-DD
			return t.Format("2006-01-02")
		}
	}

	// Return original if parsing fails
	return dateStr
}

// Helper function to get metrics
func getMetrics(data map[string]interface{}) map[string]interface{} {
	if metrics, ok := data["metrics"].(map[string]interface{}); ok {
		return metrics
	}
	return make(map[string]interface{})
}

func GetExercises(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("exercises").
		Select("id,name,description,tracking_type", "exact", false).
		Execute()

	if err != nil {
		return c.Status(500).SendString("Could not retrieve exercises: " + err.Error())
	}

	var exercises []models.Exercise
	if err := json.Unmarshal(data, &exercises); err != nil {
		return c.Status(500).SendString("Failed to parse exercises: " + err.Error())
	}

	return c.JSON(exercises)
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
