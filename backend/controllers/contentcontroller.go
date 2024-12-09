package controllers

import (
	"backend/entities"
	"backend/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

var contentModel = models.NewContentModel()
var subheadingModel = models.NewSubheadingModel()

func GetIdTitleAllContents(response http.ResponseWriter, request *http.Request) {
	response.Header().Set("Content-Type", "application/json")

	contents, err := contentModel.FindAll()
	if err != nil {
		http.Error(response, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(response).Encode(contents)
}

func SearchContent(response http.ResponseWriter, request *http.Request) {
    response.Header().Set("Content-Type", "application/json")

    searchTerm := request.URL.Query().Get("q")
    if searchTerm == "" {
        http.Error(response, "Query parameter 'q' is required", http.StatusBadRequest)
        return
    }

    // log.Printf("Received search term: %s", searchTerm)

    contents, err := contentModel.Search(searchTerm)
    if err != nil {
        http.Error(response, fmt.Sprintf("Error during search: %v", err), http.StatusInternalServerError)
        return
    }

    if len(contents) == 0 {
        response.WriteHeader(http.StatusOK)
        json.NewEncoder(response).Encode(map[string]interface{}{
            "message": "Kalimat tidak ada di database",
            "data":    []string{}, // Kirim array kosong
        })
        return
    }

    json.NewEncoder(response).Encode(map[string]interface{}{
        "message": "Data ditemukan",
        "data":    contents,
    })
}

func GetContentByID(response http.ResponseWriter, request *http.Request) {
	response.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(request)
	idStr := vars["id"]

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(response, "Invalid content ID", http.StatusBadRequest)
		return
	}

	content, authorName, err := contentModel.FindByIDWithAuthorName(id)
	if err != nil {
		http.Error(response, err.Error(), http.StatusInternalServerError)
		return
	}

	if content == nil {
		http.Error(response, "Content not found", http.StatusNotFound)
		return
	}

	subheadings, err := subheadingModel.FindByContentID(content.Id)
	if err != nil {
		http.Error(response, err.Error(), http.StatusInternalServerError)
		return
	}

	data := map[string]interface{}{
		"content":     content,
		"author_name": authorName,
		"subheadings": subheadings,
	}

	json.NewEncoder(response).Encode(data)
}

func EditContentByID(response http.ResponseWriter, request *http.Request) {
	response.Header().Set("Content-Type", "application/json")

	// Extract content ID from URL path
	pathParts := strings.Split(request.URL.Path, "/")
	idStr := pathParts[len(pathParts)-1]
	contentID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(response, "Invalid content ID", http.StatusBadRequest)
		return
	}
	log.Printf("Editing content with ID: %d", contentID)

	var requestData struct {
		Title       string                `json:"title"`
		Description string                `json:"description"`
		AuthorID    int64                 `json:"author_id"`
		InstanceID  int64                 `json:"instance_id"`
		Tag         string                `json:"tag"`
		Subheadings []entities.Subheading `json:"subheadings"`
	}

	err = json.NewDecoder(request.Body).Decode(&requestData)
	if err != nil {
		log.Println("Error parsing request body:", err)
		http.Error(response, "Error parsing request body", http.StatusBadRequest)
		return
	}

	if requestData.InstanceID == 0 {
		log.Println("InstanceID is missing or invalid")
		http.Error(response, "Instance ID is missing", http.StatusBadRequest)
		return
	}

	updatedContent := entities.Content{
		Id:          contentID,
		Title:       requestData.Title,
		Description: sql.NullString{String: requestData.Description, Valid: requestData.Description != ""},
		Author_id:   0,  // Don't update the Author_id
		Updated_at:  time.Now().Format("2006-01-02 15:04:05"),
		Instance_id: requestData.InstanceID,
		Tag:         requestData.Tag,
	}

	err = contentModel.UpdateByID(updatedContent)
	if err != nil {
		log.Println("Error updating content:", err)
		http.Error(response, "Failed to update content in database", http.StatusInternalServerError)
		return
	}

	// Update each subheading related to the content (same logic here)
	for _, subheading := range requestData.Subheadings {
		subheading.Author_id = 0  // Don't update the Author_id for subheadings either
		subheading.Updated_at = time.Now().Format("2006-01-02 15:04:05")

		err = subheadingModel.UpdateByID(subheading)
		if err != nil {
			log.Println("Error updating subheading:", err)
			http.Error(response, "Failed to update subheading in database", http.StatusInternalServerError)
			return
		}
	}

	response.WriteHeader(http.StatusOK)
	json.NewEncoder(response).Encode(map[string]string{
		"message": "Content and subheadings updated successfully",
	})
}


func CreateContent(w http.ResponseWriter, r *http.Request) {
	log.Printf("Request received: %s %s", r.Method, r.URL.Path)

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var content entities.Content

	err := json.NewDecoder(r.Body).Decode(&content)
	body, _ := io.ReadAll(r.Body)

	fmt.Printf("Request Body: %s\n", string(body))

	if err != nil {
		fmt.Printf("Error decoding JSON: %v\n", err)
		http.Error(w, "Invalid input data", http.StatusBadRequest)
		return
	}

	fmt.Printf("Decoded content: %+v\n", content)

	if content.Title == "" || content.Tag == "" || content.Author_id == 0 || content.Instance_id == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	now := time.Now().Format("2006-01-02 15:04:05")
	content.Created_at = now
	content.Updated_at = now

	contentID, err := contentModel.CreateContent(content)
	if err != nil {
		fmt.Printf("Error creating content: %v\n", err)
		http.Error(w, "Failed to create content", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message":    "Content created successfully",
		"content_id": contentID,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func DeleteContent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contentIDStr := vars["id"]
	contentID, err := strconv.ParseInt(contentIDStr, 10, 64)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid content ID: %v", err), http.StatusBadRequest)
		return
	}
	
	fmt.Println("Received DELETE request for content ID:", contentID)

	err = contentModel.DeleteByID(contentID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete content: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Content deleted successfully"))
}

func GetUserContents(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.ParseInt(vars["id"], 10, 64)

    if err != nil {
        // Return an error if the userId cannot be parsed
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    // Fetch contents for the given userId
    contents, err := contentModel.GetContentsByAuthorId(id)
    if err != nil {
        // Return an error if fetching contents fails
        http.Error(w, "Error fetching contents", http.StatusInternalServerError)
        return
    }

    // Return the fetched contents as JSON
    json.NewEncoder(w).Encode(contents)
}
