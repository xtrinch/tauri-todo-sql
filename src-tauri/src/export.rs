use rusqlite::{Connection, Result};
use serde_json::{Map, Value};
use std::error::Error;
use std::fs::File;
use std::io::Write;
use tauri::Manager;
use crate::shared::{get_connection};

fn export_to_json(conn: &Connection, json_path: &str) -> Result<(), Box<dyn Error>> {
    // Define the list of tables to export
    let table_names = vec![
        "buyers",
        "sellers",
        "tree_species",
        "wood_pieces",
        "wood_piece_offers",
        "settings",
    ];
    let mut json_map = Map::new();

    for table in table_names {
        let columns = get_column_names(table);
        let query = format!("SELECT {} FROM {}", columns, table);
        let mut table_stmt = conn.prepare(&query)?;

        let column_names: Vec<String> = table_stmt
            .column_names()
            .iter()
            .map(|s| s.to_string())
            .collect();

        let rows = table_stmt.query_map([], |row| {
            let mut obj = Map::new();
            for (i, col) in column_names.iter().enumerate() {
                let value: Value = match row.get_ref(i)? {
                    rusqlite::types::ValueRef::Null => Value::Null,
                    rusqlite::types::ValueRef::Integer(i) => Value::from(i),
                    rusqlite::types::ValueRef::Real(r) => Value::from(r),
                    rusqlite::types::ValueRef::Text(t) => Value::from(String::from_utf8_lossy(t)),
                    rusqlite::types::ValueRef::Blob(_) => {
                        Value::String("BLOB data not supported".to_string())
                    }
                };
                obj.insert(col.clone(), value);
            }
            Ok(Value::Object(obj))
        })?;

        let table_data: Vec<Value> = rows.filter_map(Result::ok).collect();
        json_map.insert(table.to_string(), Value::Array(table_data));
    }

    // Write JSON to file
    let mut file = File::create(json_path)?;
    let json_string = serde_json::to_string_pretty(&Value::Object(json_map))?;
    file.write_all(json_string.as_bytes())?;

    Ok(())
}

// Helper function to generate column names for tables
fn get_column_names(table: &str) -> &str {
    match table {
        "buyers" => "id, buyer_name, address_line1, address_line2, additional_costs, is_vat_liable, used_bundle, used_loading, loading_costs, ident",
        "sellers" => "id, seller_name, address_line1, address_line2, iban, ident, is_flat_rate, is_vat_liable, used_transport, used_logging, used_logging_non_woods, additional_costs, transport_costs, logging_costs",
        "tree_species" => "id, tree_species_name, latin_name, tree_species_name_slo",
        "wood_pieces" => "id, length, sequence_no, width, plate_no, seller_id, tree_species_id, min_price, bypass_min_price",
        "wood_piece_offers" => "id, offered_price, wood_piece_id, buyer_id",
        "settings" => "id, licitator_fixed_cost, licitator_percentage, bundle_cost",
        _ => "",
    }
}

#[tauri::command]
pub fn write_json(app_handle: tauri::AppHandle, file_path: String) -> Result<(), String> {
    let conn: Connection =
        get_connection(app_handle).map_err(|e| format!("Error opening database: {}", e))?;

    export_to_json(&conn, &file_path).map_err(|e| format!("Error exporting database: {}", e))?;
    println!("Data exported to JSON successfully!");

    Ok(())
}
