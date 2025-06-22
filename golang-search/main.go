package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

type Quote struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Number   string `json:"number"`
	IssuedAt string `json:"issuedAt"`
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Erreur de connexion à la BDD:", err)
	}

	http.HandleFunc("/search/quotes", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query().Get("query")

		rows, err := db.Query(`
			SELECT id, title, number, issued_at
			FROM quote
			WHERE title ILIKE '%' || $1 || '%'
		`, query)
		if err != nil {
			http.Error(w, "Erreur SQL: "+err.Error(), 500)
			return
		}
		defer rows.Close()

		var results []Quote
		for rows.Next() {
			var q Quote
			if err := rows.Scan(&q.ID, &q.Title, &q.Number, &q.IssuedAt); err == nil {
				results = append(results, q)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	})

	log.Println("Serveur Go Search lancé sur :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
