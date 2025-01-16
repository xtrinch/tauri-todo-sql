use rusqlite::Connection;
use std::error::Error;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use tauri::Manager;
use tauri_plugin_fs::FsExt;

fn backup_progress(progress: rusqlite::backup::Progress) {
    // Calculate the percentage of the backup progress
    let percentage = if progress.pagecount > 0 {
        100 - (progress.remaining * 100 / progress.pagecount)
    } else {
        0
    };

    // Print the progress
    println!("Backup progress: {}%", percentage);
}

pub fn get_connection(app_handle: tauri::AppHandle) -> Result<Connection, String> {
    // Get the app data directory path
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {}", e))?;

    // Construct the path to the SQLite database file
    let sqlite_file = app_data_dir.join("main_database_v2.db");

    // Open the SQLite connection
    Connection::open(sqlite_file).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn dump_sqlite_db(app_handle: tauri::AppHandle, file_path: String) -> Result<(), String> {
    let conn = get_connection(app_handle).map_err(|e| format!("Error opening database: {}", e))?;

    let mut dst = Connection::open(file_path).map_err(|e| e.to_string())?;

    // Backup the database to the user-selected file
    let mut backup = rusqlite::backup::Backup::new(&conn, &mut dst).map_err(|e| e.to_string())?;

    backup
        .run_to_completion(5, Duration::from_millis(250), Some(backup_progress))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn load_sqlite_db(app_handle: tauri::AppHandle, file_path: String) -> Result<(), String> {
    let mut conn =
        get_connection(app_handle).map_err(|e| format!("Error opening database: {}", e))?;

    let dst = Connection::open(file_path).map_err(|e| e.to_string())?;

    // Restore the user-selected database backup
    let mut backup = rusqlite::backup::Backup::new(&dst, &mut conn).map_err(|e| e.to_string())?;

    backup
        .run_to_completion(5, Duration::from_millis(250), Some(backup_progress))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn clear_db(app_handle: tauri::AppHandle) -> Result<(), String> {
    // Get the app data directory path
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to remove file: {}", e))?;

    // Construct the path to the SQLite database file
    let sqlite_file = app_data_dir.join("main_database_v2.db");

    // Attempt to remove the file
    if sqlite_file.exists() {
        fs::remove_file(&sqlite_file).map_err(|e| format!("Failed to remove file: {}", e))?;
        println!("File successfully removed: {:?}", sqlite_file);
    } else {
        println!("File does not exist: {:?}", sqlite_file);
    }

    Ok(())
}
