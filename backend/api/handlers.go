package api

import (
	"encoding/json"
	"log"
	"os"
	"strings"

	api "github.com/exil0867/go-trena/api/models"
	"github.com/exil0867/go-trena/db"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	gotrueTypes "github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/postgrest-go"
)

// CreateUser handles creating a new user.
func CreateUser(c fiber.Ctx) error {
	// Parse the request body into a User struct.
	var user api.User
	if err := c.Bind().Body(&user); err != nil {
		return c.Status(400).SendString("Invalid user payload: " + err.Error())
	}

	// Execute the insert query.
	data, _, err := db.Supabase.From("users").Insert(user, false, "", "representation", "").Execute()
	if err != nil {
		log.Println("Insert error:", err)
		return c.Status(500).SendString("Could not create user: " + err.Error())
	}

	// Unmarshal the returned JSON data into a slice of users.
	var result []api.User
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created user data: " + err.Error())
	}

	// Return the newly created user(s) as JSON.
	return c.JSON(result)
}

// GetUsers retrieves all users.
func GetUsers(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("users").Select("*", "exact", false).Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to retrieve users: " + err.Error())
	}

	// Unmarshal the JSON data into a slice of users.
	var users []api.User
	if err := json.Unmarshal(data, &users); err != nil {
		return c.Status(500).SendString("Failed to parse user data: " + err.Error())
	}

	return c.JSON(users)
}

// GetUser retrieves a user by ID.
func GetUser(c fiber.Ctx) error {
	id := c.Params("id")

	data, _, err := db.Supabase.From("users").Select("*", "exact", false).Eq("id", id).Execute()
	if err != nil {
		return c.Status(404).SendString("User not found: " + err.Error())
	}

	// Unmarshal the JSON data into a slice of users.
	var results []api.User
	if err := json.Unmarshal(data, &results); err != nil {
		return c.Status(500).SendString("Failed to parse user data: " + err.Error())
	}
	if len(results) == 0 {
		return c.Status(404).SendString("User not found")
	}

	// Return the first (and only) user.
	return c.JSON(results[0])
}

// UpdateUser updates an existing user.
func UpdateUser(c fiber.Ctx) error {
	id := c.Params("id")

	// Bind the request body to a User struct.
	var user api.User
	if err := c.Bind().Body(&user); err != nil {
		return c.Status(400).SendString("Invalid payload: " + err.Error())
	}

	// Execute the update query.
	data, _, err := db.Supabase.From("users").Update(user, "representation", "").Eq("id", id).Execute()
	if err != nil {
		return c.Status(500).SendString("Could not update user: " + err.Error())
	}

	// Unmarshal the returned JSON data into a slice of users.
	var result []api.User
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse updated user data: " + err.Error())
	}
	if len(result) == 0 {
		return c.Status(404).SendString("User not found")
	}

	return c.JSON(result[0])
}

// DeleteUser deletes a user by ID.
func DeleteUser(c fiber.Ctx) error {
	id := c.Params("id")

	_, _, err := db.Supabase.From("users").Delete("representation", "").Eq("id", id).Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to delete user: " + err.Error())
	}

	return c.SendStatus(204)
}

// GetUsers retrieves all users.
func GetWorkouts(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("workouts").Select("*", "exact", false).Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to retrieve workouts: " + err.Error())
	}

	// Unmarshal the JSON data into a slice of workouts.
	var users []api.Workout
	if err := json.Unmarshal(data, &users); err != nil {
		return c.Status(500).SendString("Failed to parse workout data: " + err.Error())
	}

	return c.JSON(users)
}

// CreateActivity handles creating a new activity.
func CreateActivity(c fiber.Ctx) error {
	type ActivityWithoutID struct {
		Name string `json:"name"`
	}
	var activity api.Activity
	if err := c.Bind().Body(&activity); err != nil {
		return c.Status(400).SendString("Invalid activity payload: " + err.Error())
	}

	activityToInsert := ActivityWithoutID{
		Name: activity.Name,
	}

	data, _, err := db.Supabase.From("activities").
		Insert(activityToInsert, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Could not create activity: " + err.Error())
	}

	var result []api.Activity
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created activity data: " + err.Error())
	}

	return c.JSON(result)
}

// GetActivities retrieves all activities.
func GetActivities(c fiber.Ctx) error {
	data, _, err := db.Supabase.From("activities").
		Select("*", "exact", false).Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve activities: " + err.Error())
	}

	var activities []api.Activity
	if err := json.Unmarshal(data, &activities); err != nil {
		return c.Status(500).SendString("Failed to parse activities data: " + err.Error())
	}

	return c.JSON(activities)
}

// AddUserActivity creates an association between a user and an activity.
func AddUserActivity(c fiber.Ctx) error {
	var ua api.UserActivity
	if err := c.Bind().Body(&ua); err != nil {
		return c.Status(400).SendString("Invalid user activity payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("user_activities").
		Insert(ua, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to add activity to user: " + err.Error())
	}

	var result []api.UserActivity
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse added user activity data: " + err.Error())
	}

	return c.JSON(result)
}

// GetUserActivities retrieves activities associated with a user.
func GetUserActivities(c fiber.Ctx) error {
	userID := c.Params("user_id")

	data, _, err := db.Supabase.From("user_activities").
		Select("activities (*)", "exact", false).
		Eq("user_id", userID).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve user activities: " + err.Error())
	}

	// Unmarshal into a slice of activities.
	var activities []api.Activity
	if err := json.Unmarshal(data, &activities); err != nil {
		return c.Status(500).SendString("Failed to parse user activities data: " + err.Error())
	}

	return c.JSON(activities)
}

// CreateWorkoutPlan handles creating a new workout plan.
func CreateWorkoutPlan(c fiber.Ctx) error {
	var plan api.WorkoutPlan
	if err := c.Bind().Body(&plan); err != nil {
		return c.Status(400).SendString("Invalid workout plan payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("workout_plans").
		Insert(plan, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Could not create workout plan: " + err.Error())
	}

	var result []api.WorkoutPlan
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse created workout plan data: " + err.Error())
	}

	return c.JSON(result)
}

// GetWorkoutPlanDays retrieves days for a given workout plan.
func GetWorkoutPlanDays(c fiber.Ctx) error {
	planID := c.Params("plan_id")

	data, _, err := db.Supabase.From("workout_plan_days").
		Select("*", "exact", false).
		Eq("workout_plan_id", planID).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve plan days: " + err.Error())
	}

	var days []api.WorkoutPlanDay
	if err := json.Unmarshal(data, &days); err != nil {
		return c.Status(500).SendString("Failed to parse workout plan days data: " + err.Error())
	}

	return c.JSON(days)
}

// LogWorkout logs a workout session.
func LogWorkout(c fiber.Ctx) error {
	var logEntry api.LoggedWorkout
	if err := c.Bind().Body(&logEntry); err != nil {
		return c.Status(400).SendString("Invalid logged workout payload: " + err.Error())
	}

	data, _, err := db.Supabase.From("logged_workouts").
		Insert(logEntry, false, "", "representation", "").Execute()
	if err != nil {
		return c.Status(500).SendString("Failed to log workout: " + err.Error())
	}

	var result []api.LoggedWorkout
	if err := json.Unmarshal(data, &result); err != nil {
		return c.Status(500).SendString("Failed to parse logged workout data: " + err.Error())
	}

	return c.JSON(result)
}

// GetWorkoutHistory retrieves a user's workout history, ordered by date descending.
func GetWorkoutHistory(c fiber.Ctx) error {
	userID := c.Params("user_id")

	data, _, err := db.Supabase.From("logged_workouts").
		Select("*", "exact", false).
		Eq("user_id", userID).
		Order("date", &postgrest.OrderOpts{Ascending: false}).
		Execute()
	if err != nil {
		return c.Status(500).SendString("Could not retrieve workout history: " + err.Error())
	}

	var history []api.LoggedWorkout
	if err := json.Unmarshal(data, &history); err != nil {
		return c.Status(500).SendString("Failed to parse workout history data: " + err.Error())
	}

	return c.JSON(history)
}

// AuthMiddleware is the middleware for JWT authentication

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

	// Check if the expected claim (e.g., "email") is present
	if _, exists := claims["email"]; !exists {
		log.Println("Email claim is missing")
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	// If everything is valid, pass the claims to the context
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

	// Create a SignupRequest struct
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
