use rusqlite::{Connection, Result, ToSql};
use tauri::Manager;

pub const SQL_STATEMENT_TREE_SPECIES: &str = "
    INSERT INTO tree_species (tree_species_name, latin_name, tree_species_name_slo) VALUES 
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
    \n";

pub const SQL_STATEMENT_SETTINGS: &str = "
    INSERT INTO settings (licitator_fixed_cost, licitator_percentage, bundle_cost) VALUES (22.0, 0.06, 7.0);";

pub const SQL_STATEMENT_IMAGES: &str = "
    INSERT OR IGNORE INTO images (image_key, mime_type, data_base64) VALUES
        ('header', NULL, NULL),
        ('wood', NULL, NULL);";

pub fn get_connection(app_handle: tauri::AppHandle) -> Result<Connection, String> {
    // Get the app data directory path
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {}", e))?;

    // Construct the path to the SQLite database file
    let sqlite_file = app_data_dir.join("main_database_v12.db");

    // Open the SQLite connection
    Connection::open(sqlite_file).map_err(|e| e.to_string())
}
