package entities

import (
	"database/sql"
)

type Content struct {
	Id          int64          `json:"id"`
	Title       string         `json:"title"`
	Description sql.NullString `json:"description"`
	Author_id   int64          `json:"author_id"`
	Instance_id int64          `json:"instance_id"`
	Created_at  string         `json:"created_at"`
	Updated_at  string         `json:"updated_at"`
	Tag         string         `json:"tag"`
}