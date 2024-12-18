// src/lib/database.ts
import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:main.db");
  }
  return dbInstance;
}
