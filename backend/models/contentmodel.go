package models

import (
	"backend/config"
	"backend/entities"
	"database/sql"
	"fmt"
)

type ContentModel struct {
	conn *sql.DB
}

func NewContentModel() *ContentModel {
	conn, err := config.DBConnection()

	if err != nil {
		panic(err)
	}

	return &ContentModel{
		conn: conn,
	}
}

func (p *ContentModel) FindAll() ([]entities.Content, error) {
	query := "SELECT id, title FROM content"
	rows, err := p.conn.Query(query)
	if err != nil {
		return []entities.Content{}, err
	}
	defer rows.Close()

	var dataContent []entities.Content
	for rows.Next() {
		var content entities.Content
		err := rows.Scan(
			&content.Id, 
			&content.Title)
		if err != nil {
			return []entities.Content{}, err
		}
		dataContent = append(dataContent, content)
	}

	return dataContent, nil
}

func (model *ContentModel) Search(searchTerm string) ([]entities.Content, error) {
	var contents []entities.Content

	query := `SELECT id, title, description, author_id, instance_id, created_at, updated_at, tag 
	          FROM content 
	          WHERE title LIKE ? OR tag LIKE ?`

	searchTerm = "%" + searchTerm + "%"

	rows, err := model.conn.Query(query, searchTerm, searchTerm)
	if err != nil {
		return nil, fmt.Errorf("error executing search query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var content entities.Content
		if err := rows.Scan(&content.Id, &content.Title, &content.Description, &content.Author_id,
			&content.Instance_id, &content.Created_at, &content.Updated_at, &content.Tag); err != nil {
			return nil, fmt.Errorf("error scanning result: %v", err)
		}
		contents = append(contents, content)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %v", err)
	}

	return contents, nil
}

func (p *ContentModel) UpdateByID(content entities.Content) error {
	query := `
        UPDATE content 
        SET title = ?, description = ?, updated_at = ?, instance_id = ?, tag = ? 
        WHERE id = ?`
	
	_, err := p.conn.Exec(
		query, 
		content.Title, 
		content.Description, 
		content.Updated_at,
		content.Instance_id,
		content.Tag,
		content.Id,
	)
	return err
}

func (p *ContentModel) CreateContent(content entities.Content) (int64, error) {
	query := `
		INSERT INTO content (title, description, author_id, created_at, updated_at, tag, instance_id) 
		VALUES (?, ?, ?, ?, ?, ?, ?)`

	result, err := p.conn.Exec(
		query,
		content.Title,
		content.Description, 
		content.Author_id,
		content.Created_at,
		content.Updated_at,
		content.Tag,
		content.Instance_id)

	if err != nil {
		return 0, err
	}

	contentID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return contentID, nil
}

func (p *ContentModel) DeleteByID(contentID int64) error {
	query := "DELETE FROM content WHERE id = ?"
	fmt.Println("Executing query:", query, " with ID:", contentID)
	_, err := p.conn.Exec(query, contentID)
	if err != nil {
		return fmt.Errorf("error deleting content: %v", err)
	}
	return nil
}

func (p *ContentModel) FindByIDWithAuthorName(id int64) (*entities.Content, string, error) {
	query := `
		SELECT c.id, c.title, c.description, c.author_id, c.instance_id, c.created_at, c.updated_at, c.tag, u.name AS author_name
		FROM content c
		LEFT JOIN user u ON c.author_id = u.id
		WHERE c.id = ?
	`
	row := p.conn.QueryRow(query, id)

	var content entities.Content
	var authorName string
	err := row.Scan(
		&content.Id,
		&content.Title,
		&content.Description,
		&content.Author_id,
		&content.Instance_id,
		&content.Created_at,
		&content.Updated_at,
		&content.Tag,
		&authorName,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, "", nil
		}
		return nil, "", err
	}

	return &content, authorName, nil 
}

func (s *ContentModel) GetContentsByAuthorId(authorId int64) ([]entities.Content, error) {
    var contents []entities.Content
    query := `SELECT id, title, created_at, author_id FROM content WHERE author_id = ?`
    rows, err := s.conn.Query(query, authorId)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var content entities.Content
        if err := rows.Scan(
			&content.Id, 
			&content.Title, 
			&content.Created_at, 
			&content.Author_id); err != nil {
            return nil, err
        }
        contents = append(contents, content)
    }
    return contents, nil
}
