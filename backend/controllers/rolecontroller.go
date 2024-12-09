package controllers

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
)

var roleModel = models.NewRoleModel()

func GetRoles(w http.ResponseWriter, r *http.Request) {
    role, err := roleModel.GetAllRoles()
    if err != nil {
        http.Error(w, fmt.Sprintf("Error retrieving instances: %v", err), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(role)
}