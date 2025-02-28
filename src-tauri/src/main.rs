// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
pub mod commands;
use std::error::Error;
pub mod export;
pub mod import;
pub mod shared;

fn main() -> Result<(), Box<dyn Error>> {
    licitacija_lib::run()
}
