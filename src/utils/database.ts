// src/lib/database.ts
import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:main_database_v9.db");
  }
  return dbInstance;
}

export async function getDatabaseForModify(): Promise<Database> {
  localStorage.setItem("unsaved_changes_v9", "true");
  window.dispatchEvent(new Event("storage"));
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:main_database_v9.db");
  }
  return dbInstance;
}

export function unsetDatabase(): void {
  dbInstance = null;
}
