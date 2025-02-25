package db

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	supa "github.com/supabase-community/supabase-go"
)

// Supabase is the client used throughout the app.
var Supabase *supa.Client

// CreateClient loads env vars and creates a Supabase client.
func CreateClient() {
	// Load environment variables from .env file
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: No .env file found")
	}

	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_KEY")
	if url == "" || key == "" {
		log.Fatal("Missing SUPABASE_URL or SUPABASE_KEY in env")
	}

	var clientErr error
	Supabase, clientErr = supa.NewClient(url, key, &supa.ClientOptions{})
	if clientErr != nil {
		log.Println("cannot initalize client", clientErr)
	}
	log.Println("Supabase client created successfully")
}
