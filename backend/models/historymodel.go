package models

import (
	"backend/config"
	"backend/entities"
	"database/sql"
	"fmt"
)

type HistoryModel struct {
	conn *sql.DB
}

func NewHistoryModel() *HistoryModel  {
	conn, err := config.DBConnection()
	if err != nil {
		panic(err)
	}
	return &HistoryModel {conn: conn}
}

func (p *HistoryModel) AddHistoryRecord(history entities.History) error {
	query := `INSERT INTO content_edit_history (content_id, editor_id, edited_at) VALUES (?, ?, ?)`
	_, err := p.conn.Exec(query, 
		history.Content_Id, 
		history.Editor_Id, 
		history.Edited_at)
	if err != nil {
		return fmt.Errorf("failed to add history record: %w", err)
	}

	return nil
}

func (p *HistoryModel) GetHistoriesByUserId(userId string) ([]entities.History, error) {
    var histories []entities.History
    rows, err := p.conn.Query("SELECT id, content_id, editor_id, edited_at FROM content_edit_history WHERE editor_id = ?", userId)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var history entities.History
        if err := rows.Scan(&history.Id, &history.Content_Id, &history.Editor_Id, &history.Edited_at); err != nil {
            return nil, err
        }
        histories = append(histories, history)
    }
    return histories, nil
}

func (p *HistoryModel) GetLatestEditorName(contentId string) (string, error) {
    var editorName string
    query := `
        SELECT user.name 
        FROM content_edit_history 
        JOIN user ON content_edit_history.editor_id = user.id
        WHERE content_edit_history.content_id = ?
        ORDER BY content_edit_history.edited_at DESC
        LIMIT 1
    `

    err := p.conn.QueryRow(query, contentId).Scan(&editorName)
    if err != nil {
        return "", err
    }

    return editorName, nil
}
