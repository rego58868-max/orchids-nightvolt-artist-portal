import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://db-0dd431c7-b7aa-4946-939a-90b2e953a2e5-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjUwMjkyMDQsImlkIjoiZWE2NGU2ZTMtNmE3OC00YzViLTkxMDYtYTY4ZjEzOGM2ZWVhIiwicmlkIjoiZDNkYTg0M2QtMzM4MS00NjhlLWExOWQtNmY5NzJkOTJmMDk3In0.3LiXwcb7b-qjci-QnmpBYlY9GOPFW2kCFeIAEG3q4zc-EnzVFwCTazC02ndDhREZhcJhVaM7J_hXyTOFCFkGBg',
});

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ticket_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id),
      message_id INTEGER REFERENCES ticket_messages(id),
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL REFERENCES artists(id),
      uploaded_by_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  console.log('Table created');
}

main();
