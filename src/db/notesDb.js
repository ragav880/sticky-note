import { openDatabaseAsync } from "expo-sqlite";
import * as Crypto from "expo-crypto";

let db;

export async function initDB() {
  db = await openDatabaseAsync("notes.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      content TEXT,
      date TEXT,
      reminder_enabled INTEGER,
      reminder_id TEXT,
      color TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // Add color column if missing
  try {
    await db.execAsync(`ALTER TABLE notes ADD COLUMN color TEXT;`);
  } catch (e) {
    // Column already exists → ignore
  }

  console.log("DB ready");
}


// ADD NEW NOTE
export async function addNote(note, callback) {
  const id = await Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO notes 
    (id, title, content, date, reminder_enabled, reminder_id, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      note.title,
      note.content,
      note.date,
      note.reminder_enabled ? 1 : 0,
      note.reminder_id,
      note.color || "#fef3c7", // default yellow
      now,
      now,
    ]
  );

  callback && callback(null, { id });
}


// GET ALL NOTES
export async function fetchAllNotes() {
  return await db.getAllAsync("SELECT * FROM notes ORDER BY created_at DESC;");
}


// TODAY'S NOTES
export async function fetchTodayNotes() {
  const today = new Date().toISOString().split("T")[0];

  return await db.getAllAsync(
    "SELECT * FROM notes WHERE date = ? ORDER BY created_at DESC;",
    [today]
  );
}


// GET NOTE BY ID
export async function fetchNoteById(id) {
  return await db.getFirstAsync(
    "SELECT * FROM notes WHERE id = ? LIMIT 1;",
    [id]
  );
}


// UPDATE NOTE
export async function updateNote(note, callback) {
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE notes
     SET title=?, content=?, date=?, reminder_enabled=?, reminder_id=?, color=?, updated_at=?
     WHERE id=?`,
    [
      note.title,
      note.content,
      note.date,
      note.reminder_enabled ? 1 : 0,
      note.reminder_id,
      note.color || "#fef3c7",
      now,
      note.id,
    ]
  );

  callback && callback(null);
}


// DELETE
export async function deleteNote(id) {
  await db.runAsync("DELETE FROM notes WHERE id = ?;", [id]);
}
