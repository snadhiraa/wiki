package main

import (
	contentcontroller "backend/controllers"
	historycontroller "backend/controllers"
	instancecontroller "backend/controllers"
	rolecontroller "backend/controllers"
	subheadingcontroller "backend/controllers"
	usercontroller "backend/controllers"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	// Buat router baru
	r := mux.NewRouter()

	// Konfigurasi CORS
	cors := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3001"}),                                       // Frontend URL
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),                     // Allowed HTTP methods
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-Requested-With", "Accept"}), // Allow additional headers if needed
		handlers.AllowCredentials(), // Allow cookies or other credentials
	)

	// Tambahkan endpoint ke router
	r.HandleFunc("/api", contentcontroller.GetIdTitleAllContents).Methods("GET")
	r.HandleFunc("/api/content", contentcontroller.SearchContent).Methods("GET")
	r.HandleFunc("/api/content/{id}", contentcontroller.GetContentByID).Methods("GET")
	r.HandleFunc("/api/content/edit/{id}", contentcontroller.EditContentByID).Methods("PUT")
	r.HandleFunc("/api/content/add", contentcontroller.CreateContent).Methods("POST")
	r.HandleFunc("/api/subheading/add/{id}", subheadingcontroller.CreateSubheading).Methods("POST")
	r.HandleFunc("/api/subheading/delete/{id}", contentcontroller.DeleteSubheadingByID).Methods("DELETE")
	r.HandleFunc("/api/login", usercontroller.Login).Methods("POST")
	r.HandleFunc("/api/content/delete/{id}", contentcontroller.DeleteContent).Methods("DELETE")
	r.HandleFunc("/api/instances", instancecontroller.GetInstances).Methods("GET")
	r.HandleFunc("/api/user/{id}", usercontroller.GetUserByID).Methods("GET")
	r.HandleFunc("/api/users", usercontroller.GetAllUsers).Methods("GET")
	r.HandleFunc("/api/roles", rolecontroller.GetRoles).Methods("GET")
	r.HandleFunc("/api/createuser", usercontroller.CreateUser).Methods("POST")
	r.HandleFunc("/api/user/edit/{id}", usercontroller.EditUserById).Methods("PUT")
	r.HandleFunc("/api/user/{id}", usercontroller.DeleteUser).Methods("DELETE")
	r.HandleFunc("/api/history/add", historycontroller.AddHistory).Methods("POST")
	r.HandleFunc("/api/history/user/{id}", historycontroller.GetByIdUser).Methods("GET")
	r.HandleFunc("/api/latest-editor-name/{contentId}", historycontroller.GetLatestEditorNameByContentId).Methods("GET")
	r.HandleFunc("/api/contents/user/{id}", contentcontroller.GetUserContents).Methods("GET")


	// Jalankan server dengan middleware CORS
	// log.Println("Server is running on port 3000")
	log.Fatal(http.ListenAndServe(":3000", cors(r)))
}
