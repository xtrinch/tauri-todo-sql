use tauri_plugin_sql::{Migration, MigrationKind};
use std::error::Error;
use csv::ReaderBuilder;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<(), Box<dyn Error>> {
    // Open the input CSV file
    println!("Current working directory: {:?}", std::env::current_dir()?);

    let file_path = std::env::current_dir()?.join("transformed_tree_species.csv");
    let mut reader = ReaderBuilder::new()
        .has_headers(true) // Assume the first row contains headers
        .from_path(file_path)?;

    // Prepare the output SQL statement
    let mut sql_statement = String::from(
        "INSERT INTO tree_species (name, latin_name) VALUES\n"
    );

    // Iterate through the CSV records
    for result in reader.records() {
        let record = result?;
        let name = record.get(0).unwrap_or("").replace("'", "''");
        let latin_name = record.get(1).unwrap_or("").replace("'", "''");

        sql_statement.push_str(&format!(
            "('{}', '{}'),\n",
            name, latin_name
        ));
    }

    // Remove the trailing comma and newline, and add a semicolon
    if sql_statement.ends_with(",\n") {
        sql_statement.truncate(sql_statement.len() - 2);
    }
    sql_statement.push_str(";");

    // Use Box::leak to ensure sql_statement has a 'static lifetime
    let sql_statement_static: &'static str = Box::leak(sql_statement.into_boxed_str());

    // Define tables
    let tables = vec![
        "buyers",
        "sellers",
        "tree_species",
        "wood_pieces",
        "wood_piece_offer",
    ];

    // Migrations with triggers for all tables
    let mut migrations = vec![
        Migration {
            version: 0,
            description: "create_undolog_table",
            sql: "CREATE TABLE IF NOT EXISTS undolog (
                    seq INTEGER PRIMARY KEY AUTOINCREMENT,
                    sql TEXT NOT NULL
                  );",
            kind: MigrationKind::Up,
        },
    ];

    // Create main tables and add triggers dynamically
    for (i, table) in tables.iter().enumerate() {
        // Base table creation SQL
        let table_creation_sql = match *table {
            "buyers" => "CREATE TABLE IF NOT EXISTS buyers (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                name VARCHAR, 
                address_line1 VARCHAR, 
                address_line2 VARCHAR
            );",
            "sellers" => "CREATE TABLE IF NOT EXISTS sellers (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                name VARCHAR, 
                address_line1 VARCHAR, 
                address_line2 VARCHAR
            );",
            "tree_species" => "CREATE TABLE IF NOT EXISTS tree_species (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                name VARCHAR, 
                latin_name VARCHAR
            );",
            "wood_pieces" => "CREATE TABLE IF NOT EXISTS wood_pieces (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                length REAL,
                sequence_no INTEGER,
                width REAL, 
                volume REAL, 
                max_price REAL, 
                plate_no VARCHAR,
                seller_id INTEGER,
                tree_species_id INTEGER,
                FOREIGN KEY(seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
                FOREIGN KEY(tree_species_id) REFERENCES tree_species(id)
            );",
            "wood_piece_offer" => "CREATE TABLE IF NOT EXISTS wood_piece_offer (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                offered_price REAL, 
                wood_piece_id INTEGER,
                buyer_id INTEGER,
                FOREIGN KEY(buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
                FOREIGN KEY(wood_piece_id) REFERENCES wood_pieces(id) ON DELETE CASCADE
            );",
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

        let descriptionTrigger = Box::leak(format!("add_triggers_for_{}", table).into_boxed_str());
        let sql = Box::leak(format!(
            "
            -- INSERT Trigger
            CREATE TRIGGER IF NOT EXISTS {0}_insert AFTER INSERT ON {0}
            BEGIN
                INSERT INTO undolog (sql) VALUES (
                    'DELETE FROM {0} WHERE id=' || NEW.id
                );
            END;

            -- DELETE Trigger
            CREATE TRIGGER IF NOT EXISTS {0}_delete AFTER DELETE ON {0}
            BEGIN
                INSERT INTO undolog (sql) VALUES (
                    'INSERT INTO {0} ({1}) VALUES ({2})'
                );
            END;

            -- UPDATE Trigger
            CREATE TRIGGER IF NOT EXISTS {0}_update AFTER UPDATE ON {0}
            BEGIN
                INSERT INTO undolog (sql) VALUES (
                    'UPDATE {0} SET {3} WHERE id=' || OLD.id
                );
            END;
            ",
            table,
            get_column_names(*table), // Comma-separated column names
            get_column_placeholders(*table, "OLD"), // Placeholder for old values
            get_update_set_statements(*table), // Comma-separated update set statements
        ).into_boxed_str());

        // Add triggers for this table
        migrations.push(Migration {
            version: (i + 10) as i64,
            description: descriptionTrigger,
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
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:main.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}

// Helper function to generate column names for tables
fn get_column_names(table: &str) -> &str {
    match table {
        "buyers" => "id, name, address_line1, address_line2",
        "sellers" => "id, name, address_line1, address_line2",
        "tree_species" => "id, name, latin_name",
        "wood_pieces" => "id, length, sequence_no, width, volume, max_price, plate_no, seller_id, tree_species_id",
        "wood_piece_offer" => "id, offered_price, wood_piece_id, buyer_id",
        _ => "",
    }
}

// Helper function to generate placeholders for old values
fn get_column_placeholders(table: &str, prefix: &str) -> String {
    get_column_names(table)
        .split(", ")
        .map(|col| format!("{}.{}", prefix, col)) // Generate strings for each column
        .collect::<Vec<String>>() // Collect into a Vec<String>
        .join(", ") // Join with commas
}

// Helper function to generate update set statements
fn get_update_set_statements(table: &str) -> String {
    get_column_names(table)
        .split(", ")
        .filter(|col| *col != "id") // Exclude the primary key
        .map(|col| format!("{}=' || OLD.{} || '", col, col)) // Generate strings for each column
        .collect::<Vec<String>>() // Collect into a Vec<String>
        .join(", ") // Join with commas
}