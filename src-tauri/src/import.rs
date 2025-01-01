use rusqlite::{Connection, Result, ToSql};
use serde_json::{Map, Value};
use std::fs;
use tauri::Manager;

fn import_from_json(conn: &Connection, json_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Read JSON file
    let json_content = fs::read_to_string(json_path)?;
    let data: Map<String, Value> = serde_json::from_str(&json_content)?;

    // Define the specific import sequence
    let import_sequence = vec![
        "buyers",
        "sellers",
        "tree_species",
        "wood_pieces",
        "wood_piece_offers",
    ];
    
    // Truncate all tables in the import sequence
    for table in import_sequence.iter().rev() {
        let truncate_query = format!("DELETE FROM {};", table);
        println!("{}",truncate_query);
        conn.execute(&truncate_query, [])?;
    }
    
    // Iterate over tables in the JSON
    for table in import_sequence {
        if let Some(Value::Array(rows)) = data.get(table) {
            for row in rows {
                if let Value::Object(columns) = row {
                    // Prepare column names and placeholders for the query
                    let col_names: Vec<&str> = columns.keys().map(String::as_str).collect();
                    let placeholders: Vec<String> = col_names.iter().map(|_| "?".to_string()).collect();

                    let query = format!(
                        "INSERT INTO {} ({}) VALUES ({});",
                        table,
                        col_names.join(", "),
                        placeholders.join(", ")
                    );
                    println!("{}",query);

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
                        .map(|opt| opt.as_ref().map(|b| b.as_ref()).unwrap_or(&rusqlite::types::Null))
                        .collect();

                    // Execute the insertion
                    conn.execute(&query, values.as_slice())?;
                }
            }
        }
    }

    Ok(())
}

pub fn get_connection(app_handle: tauri::AppHandle) -> Result<Connection, String> {
    // Get the app data directory path
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {}", e))?;

    // Construct the path to the SQLite database file
    let sqlite_file = app_data_dir.join("main_database.db");

    // Open the SQLite connection
    Connection::open(sqlite_file).map_err(|e| e.to_string())
}


#[tauri::command]
pub fn read_json(app_handle: tauri::AppHandle, file_path: String) -> Result<(), String> {
    let conn: Connection = get_connection(app_handle).map_err(|e| format!("Error opening database: {}", e))?;

    import_from_json(&conn, &file_path).map_err(|e| format!("Error importing database: {}", e))?;
    println!("Data imported from JSON successfully!");

    Ok(())
}