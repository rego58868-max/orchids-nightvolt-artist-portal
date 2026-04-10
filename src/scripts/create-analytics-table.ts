import { createClient } from '@libsql/client';

const client = createClient({
  url: "libsql://db-0dd431c7-b7aa-4946-939a-90b2e953a2e5-orchids.aws-us-west-2.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjUwMjkyMDQsImlkIjoiZWE2NGU2ZTMtNmE3OC00YzViLTkxMDYtYTY4ZjEzOGM2ZWVhIiwicmlkIjoiZDNkYTg0M2QtMzM4MS00NjhlLWExOWQtNmY5NzJkOTJmMDk3In0.3LiXwcb7b-qjci-QnmpBYlY9GOPFW2kCFeIAEG3q4zc-EnzVFwCTazC02ndDhREZhcJhVaM7J_hXyTOFCFkGBg",
});

async function main() {
  console.log("Creating artist_analytics table...");
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS artist_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artist_id INTEGER NOT NULL REFERENCES artists(id),
        date TEXT NOT NULL,
        total_streams INTEGER NOT NULL DEFAULT 0,
        streams_over_30s INTEGER NOT NULL DEFAULT 0,
        unique_listeners INTEGER NOT NULL DEFAULT 0,
        subscribers INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    console.log("Table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

main();
