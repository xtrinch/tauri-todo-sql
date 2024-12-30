// use csv::ReaderBuilder;
use std::error::Error;
use tauri_plugin_sql::{Migration, MigrationKind};
mod commands;
use std::fs;
use tauri::Manager;
use tauri::{Window, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<(), Box<dyn Error>> {
    // Open the input CSV file
    println!("Current working directory: {:?}", std::env::current_dir()?);

    // Prepare the output SQL statement
    let sql_statement =
        String::from("INSERT INTO tree_species (tree_species_name, latin_name, tree_species_name_slo) VALUES 
        ('Sessile oak', 'Quercus petraea', 'Hrast graden'),
        ('Pedunculate oak', 'Quercus robur', 'Hrast dob'),
        ('Beech', 'Fagus sylvatica', 'Bukev'),
        ('Black locust', 'Robinia pseudoacacia', 'Robinija'),
        ('European ash', 'Fraxinus excelsior', 'Veliki jesen'),
        ('Linden', 'Tilia spp.', 'Lipa'),
        ('Wild cherry', 'Prunus avium', 'Divja češnja'),
        ('Sharp-leaved ash', 'Fraxinus angustifolia', 'Ostrolistni jesen'),
        ('Black alder', 'Alnus glutinosa', 'Črna jelša'),
        ('Walnut', 'Juglans regia', 'Domači oreh'),
        ('Black poplar', 'Populus nigra', 'Črni topol'),
        ('Pear', 'Pyrus spp.', 'Hruška'),
        ('Sweet chestnut', 'Castanea sativa', 'Pravi kostanj'),
        ('Douglas fir', 'Pseudotsuga menziesii', 'Duglazija'),
        ('Northern red oak', 'Quercus rubra', 'Rdeči hrast'),
        ('European white elm', 'Ulmus laevis', 'Vezi'),
        ('Eastern white pine', 'Pinus strobus', 'Zeleni bor'),
        ('Scots pine', 'Pinus sylvestris', 'Rdeči bor'),
        ('Spruce', 'Picea abies', 'Smreka'),
        ('Sycamore maple', 'Acer pseudoplatanus', 'Gorski javor');
        \n");

    // Use Box::leak to ensure sql_statement has a 'static lifetime
    let sql_statement_static: &'static str = Box::leak(sql_statement.into_boxed_str());

    // Define tables
    let tables = vec![
        "buyers",
        "sellers",
        "tree_species",
        "wood_pieces",
        "wood_piece_offers",
    ];

    // Migrations with triggers for all tables
    let mut migrations = vec![Migration {
        version: 0,
        description: "create_undolog_table",
        sql: "CREATE TABLE IF NOT EXISTS undolog (
                    seq INTEGER PRIMARY KEY AUTOINCREMENT,
                    sql TEXT NOT NULL
                  );",
        kind: MigrationKind::Up,
    }];

    // Create main tables and add triggers dynamically
    for (i, table) in tables.iter().enumerate() {
        // Base table creation SQL
        let table_creation_sql = match *table {
            "buyers" => {
                "CREATE TABLE IF NOT EXISTS buyers (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                buyer_name VARCHAR, 
                address_line1 VARCHAR, 
                address_line2 VARCHAR
            );"
            }
            "sellers" => {
                "CREATE TABLE IF NOT EXISTS sellers (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                seller_name VARCHAR, 
                address_line1 VARCHAR, 
                address_line2 VARCHAR,
                iban VARCHAR,
                ident VARCHAR,
                is_flat_rate INTEGER,
                is_vat_liable INTEGER,
                used_transport INTEGER
            );"
            }
            "tree_species" => {
                "CREATE TABLE IF NOT EXISTS tree_species (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                tree_species_name VARCHAR, 
                latin_name VARCHAR,
                tree_species_name_slo VARCHAR
            );"
            }
            "wood_pieces" => {
                "CREATE TABLE IF NOT EXISTS wood_pieces (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                length REAL,
                sequence_no INTEGER,
                width REAL, 
                volume REAL AS (round(3.14159265359 * width * 0.5 * 0.01 * width * 0.5 * 0.01 * length, 2)) STORED, 
                plate_no VARCHAR,
                seller_id INTEGER,
                tree_species_id INTEGER,
                min_price REAL, 
                FOREIGN KEY(seller_id) REFERENCES sellers(id) ON DELETE RESTRICT,
                FOREIGN KEY(tree_species_id) REFERENCES tree_species(id)
            );"
            }
            "wood_piece_offers" => {
                "CREATE TABLE IF NOT EXISTS wood_piece_offers (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                offered_price REAL, 
                wood_piece_id INTEGER,
                buyer_id INTEGER,
                FOREIGN KEY(buyer_id) REFERENCES buyers(id) ON DELETE RESTRICT,
                FOREIGN KEY(wood_piece_id) REFERENCES wood_pieces(id) ON DELETE RESTRICT
            );"
            }
            _ => "",
        };

        let description = Box::leak(format!("create_table_{}", table).into_boxed_str());
        // Add table creation to migrations
        migrations.push(Migration {
            version: (i + 1) as i64,
            description: description,
            sql: table_creation_sql,
            kind: MigrationKind::Up,
        });

        let description_trigger = Box::leak(format!("add_triggers_for_{}", table).into_boxed_str());
        let sql = Box::leak(
            format!(
                "
            -- INSERT Trigger
            CREATE TRIGGER IF NOT EXISTS {0}_insert AFTER INSERT ON {0}
            BEGIN
                INSERT INTO undolog (sql) VALUES (
                    'DELETE FROM {0} WHERE id=' || quote(NEW.id)
                );
            END;

            -- DELETE Trigger
            CREATE TRIGGER IF NOT EXISTS {0}_delete AFTER DELETE ON {0}
            BEGIN
                INSERT INTO undolog (sql) VALUES (
                    'INSERT INTO {0} ({1}) VALUES ({3});'
                );
            END;

            -- UPDATE Trigger
            CREATE TRIGGER IF NOT EXISTS {0}_update AFTER UPDATE ON {0}
            BEGIN
                INSERT INTO undolog (sql) VALUES (
                    'UPDATE {0} SET {2} WHERE id=' || quote(OLD.id)
                );
            END;
            ",
                table,
                get_column_names(*table), // Comma-separated column names
                get_update_set_statements(*table), // Comma-separated update set statements
                get_delete_insert_statements(*table),
            )
            .into_boxed_str(),
        );

        // Add triggers for this table
        migrations.push(Migration {
            version: (i + 10) as i64,
            description: description_trigger,
            sql: sql,
            kind: MigrationKind::Up,
        });
    }

    // Add tree species data insertion
    migrations.push(Migration {
        version: (200) as i64,
        description: "insert_tree_species_data",
        sql: sql_statement_static,
        kind: MigrationKind::Up,
    });

    // Tauri builder
    tauri::Builder::default()
        // .setup(on_setup)
        // .on_window_event(event_handler)
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:main.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::dump_sqlite_db,
            commands::load_sqlite_db,
            commands::clear_db
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}

fn event_handler(window: &Window, event: &WindowEvent) {
    match event {
        WindowEvent::Destroyed { .. } => {
            println!("Window destroyed!!");
        }
        WindowEvent::CloseRequested { .. } => {
            // Handle window close event
            println!("Window close requested!");

            // Get the app data directory path
            match window.path().app_data_dir() {
                Ok(app_data_dir) => {
                    // Construct the path to the SQLite database file
                    let sqlite_file = app_data_dir.join("main.db");

                    // Attempt to remove the file
                    if sqlite_file.exists() {
                        if let Err(e) = fs::remove_file(&sqlite_file) {
                            println!("Failed to remove file: {}", e);
                        } else {
                            println!("File successfully removed: {:?}", sqlite_file);
                        }
                    } else {
                        println!("File does not exist: {:?}", sqlite_file);
                    }
                }
                Err(e) => {
                    // Handle error if app data directory cannot be resolved
                    println!("Failed to resolve app data directory: {}", e);
                }
            }
        }
        _ => {
            // Handle other events if necessary
            println!("Other event: {:?}", event);
        }
    }
}

fn on_setup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    // Get the app data directory path
    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {}", e))?;
    
    // Construct the path to the SQLite database file
    let sqlite_file = app_data_dir.join("main.db");

    // Attempt to remove the file
    if sqlite_file.exists() {
        fs::remove_file(&sqlite_file).map_err(|e| format!("Failed to remove file: {}", e))?;
        println!("File successfully removed: {:?}", sqlite_file);
    } else {
        println!("File does not exist: {:?}", sqlite_file);
    }
    
    Ok(())
}

// Helper function to generate column names for tables
fn get_column_names(table: &str) -> &str {
    match table {
        "buyers" => "buyer_name, address_line1, address_line2",
        "sellers" => "seller_name, address_line1, address_line2, iban, ident, is_flat_rate, is_vat_liable, used_transport",
        "tree_species" => "tree_species_name, latin_name, tree_species_name_slo",
        "wood_pieces" => "length, sequence_no, width, volume, plate_no, seller_id, tree_species_id, min_price",
        "wood_piece_offers" => "offered_price, wood_piece_id, buyer_id",
        _ => "",
    }
}

// Helper function to generate update set statements with proper escaping
fn get_update_set_statements(table: &str) -> String {
    get_column_names(table)
        .split(", ")
        .filter(|col| *col != "id") // Exclude the primary key column
        .map(|col| format!("{}=' || quote(OLD.{}) || '", col, col)) // Apply quote() to OLD values
        .collect::<Vec<String>>() // Collect into a Vec<String>
        .join(", ") // Join with commas
}

// Helper function to generate update set statements with proper escaping
fn get_delete_insert_statements(table: &str) -> String {
    get_column_names(table)
        .split(", ")
        .filter(|col| *col != "id") // Exclude the primary key column
        .map(|col| format!("' || quote(OLD.{}) || '", col)) // Apply quote() to OLD values
        .collect::<Vec<String>>() // Collect into a Vec<String>
        .join(", ") // Join with commas
}
