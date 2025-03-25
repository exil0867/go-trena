package main

import (
	"log"

	"github.com/exil0867/go-trena/api"
	"github.com/exil0867/go-trena/db"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func main() {
	// Initialize Fiber app
	app := fiber.New()

	// Enable CORS for development
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8081"},
		AllowMethods:     []string{fiber.MethodGet, fiber.MethodPost, fiber.MethodPut, fiber.MethodDelete, fiber.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Initialize Supabase client
	db.CreateClient()

	app.Use(api.AuthMiddleware)

	// Define REST API routes
	app.Get("/plans/:id", api.GetPlan)
	app.Post("/plans", api.CreatePlan)
	app.Get("/plans", api.GetPlans)
	app.Get("/plans/:plan_id/groups", api.GetExerciseGroupsByPlan)
	app.Post("/exercise-groups", api.CreateExerciseGroup)
	app.Get("/exercise-groups/:group_id/exercises", api.GetExercisesByGroup)
	app.Post("/exercises", api.CreateExercise)
	app.Post("/exercise-groups/:group_id/exercises", api.AddExerciseToGroup)
	app.Get("/exercises", api.GetExercises)
	app.Post("/exercise-logs", api.LogExercise)
	app.Get("/users/:user_id/exercise-logs", api.GetExerciseLogsByUser)
	app.Get("/activities", api.GetActivities)
	app.Post("/user-activities", api.AddUserActivity)
	app.Get("/user-activities", api.GetUserActivities)

	// Start the server on port 3000
	log.Fatal(app.Listen(":3004"))
}
