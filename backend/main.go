package main

import (
	"log"

	"github.com/exil0867/go-trena/api"
	"github.com/exil0867/go-trena/db"
	"github.com/gofiber/fiber/v3"
)

func main() {
	// Initialize Fiber app
	app := fiber.New()

	// Initialize Supabase client
	db.CreateClient()

	app.Use(api.AuthMiddleware)

	// Define REST API routes
	app.Post("/users", api.CreateUser)
	app.Get("/users", api.GetUsers)
	app.Get("/users/:id", api.GetUser)
	app.Put("/users/:id", api.UpdateUser)
	app.Delete("/users/:id", api.DeleteUser)
	app.Get("/workouts", api.GetWorkouts)
	app.Post("/activities", api.CreateActivity)
	app.Get("/activities", api.GetActivities)
	app.Post("/user-activities", api.AddUserActivity)
	app.Get("/users/:user_id/activities", api.GetUserActivities)
	app.Post("/workout-plans", api.CreateWorkoutPlan)
	app.Get("/workout-plans/:plan_id/days", api.GetWorkoutPlanDays)
	app.Post("/logged-workouts", api.LogWorkout)
	app.Get("/users/:user_id/workout-history", api.GetWorkoutHistory)
	app.Post("/auth/signup", api.SignUp)
	app.Post("/auth/login", api.SignIn)
	app.Post("/auth/refresh", api.RefreshToken)
	app.Get("/auth/user", api.AuthMiddleware, api.GetUser)

	// Start the server on port 3000
	log.Fatal(app.Listen(":3004"))
}
