use rusqlite::{Connection, Result, ToSql};
use serde_json::{Map, Value};
use std::fs;
use tauri::Manager;
use crate::shared::{SQL_STATEMENT_TREE_SPECIES, SQL_STATEMENT_SETTINGS, get_connection};

fn truncate_db(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    // Define the specific import sequence
    let import_sequence = vec!["buyers", "sellers", "wood_pieces", "wood_piece_offers"];

    // Truncate all tables in the import sequence
    for table in import_sequence.iter().rev() {
        let truncate_query = format!("DELETE FROM {};", table);
        conn.execute(&truncate_query, [])?;
    }

    // Check if we have any tree species
    let tree_species_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM tree_species;",
        [],
        |row| row.get(0),
    )?;
    if tree_species_count == 0 {
        conn.execute_batch(SQL_STATEMENT_TREE_SPECIES)?;
    }

    // Check if we have settings
    let settings_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM settings;",
        [],
        |row| row.get(0),
    )?;
    if settings_count == 0 {
        conn.execute_batch(SQL_STATEMENT_SETTINGS)?;
    }

    Ok(())
}

fn import_from_json(conn: &Connection, json_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Read JSON file
    let json_content = fs::read_to_string(json_path)?;
    let data: Map<String, Value> = serde_json::from_str(&json_content)?;

    // Define the specific import sequence
    let import_sequence = vec![
        "settings",
        "buyers",
        "sellers",
        "tree_species",
        "wood_pieces",
        "wood_piece_offers",
    ];

    // Truncate tables that are present in the JSON data
    for table in import_sequence.iter().rev() {
        if data.contains_key(*table) {
            let truncate_query = format!("DELETE FROM {};", table);
            conn.execute(&truncate_query, [])?;
        }
    }

    // Iterate over tables in the JSON
    for table in import_sequence {
        if let Some(Value::Array(rows)) = data.get(table) {
            for row in rows {
                if let Value::Object(columns) = row {
                    // Prepare column names and placeholders for the query
                    let col_names: Vec<&str> = columns.keys().map(String::as_str).collect();
                    let placeholders: Vec<String> =
                        col_names.iter().map(|_| "?".to_string()).collect();

                    let query = format!(
                        "INSERT INTO {} ({}) VALUES ({});",
                        table,
                        col_names.join(", "),
                        placeholders.join(", ")
                    );

                    // Collect values into a Vec<Option<_>> to extend their lifetimes
                    let temp_values: Vec<Option<Box<dyn ToSql>>> = columns
                        .values()
                        .map(|v| match v {
                            Value::String(s) => Some(Box::new(s.clone()) as Box<dyn ToSql>),
                            Value::Number(n) => {
                                if let Some(f) = n.as_f64() {
                                    Some(Box::new(f) as Box<dyn ToSql>)
                                } else if let Some(i) = n.as_i64() {
                                    Some(Box::new(i) as Box<dyn ToSql>)
                                } else {
                                    None
                                }
                            }
                            Value::Null => None,
                            _ => None, // Unsupported types treated as NULL
                        })
                        .collect();

                    // Create references to the `temp_values` for the query
                    let values: Vec<&dyn ToSql> = temp_values
                        .iter()
                        .map(|opt| {
                            opt.as_ref()
                                .map(|b| b.as_ref())
                                .unwrap_or(&rusqlite::types::Null)
                        })
                        .collect();

                    // Execute the insertion
                    conn.execute(&query, values.as_slice())?;
                }
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub fn read_json(app_handle: tauri::AppHandle, file_path: String) -> Result<(), String> {
    let conn: Connection =
        get_connection(app_handle).map_err(|e| format!("Error opening database: {}", e))?;

    import_from_json(&conn, &file_path).map_err(|e| format!("Error importing database: {}", e))?;
    println!("Data imported from JSON successfully!");

    Ok(())
}

#[tauri::command]
pub fn truncate_all_data(app_handle: tauri::AppHandle) -> Result<(), String> {
    let conn: Connection =
        get_connection(app_handle).map_err(|e| format!("Error opening database: {}", e))?;

    truncate_db(&conn).map_err(|e| format!("Error importing database: {}", e))?;
    println!("Data truncated successfully!");

    Ok(())
}
