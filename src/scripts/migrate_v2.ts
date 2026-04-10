
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log('Starting migration...');

  const queries = [
    'ALTER TABLE artists ADD COLUMN first_name TEXT;',
    'ALTER TABLE artists ADD COLUMN last_name TEXT;',
    'ALTER TABLE artists ADD COLUMN artist_name_or_label TEXT;',
    'ALTER TABLE artists ADD COLUMN is_email_verified INTEGER DEFAULT 0;',
    'ALTER TABLE artists ADD COLUMN verification_code TEXT;',
    'ALTER TABLE artists ADD COLUMN access_status TEXT DEFAULT "pending";',
    'ALTER TABLE artists ADD COLUMN access_request_message TEXT;'
  ];

  for (const query of queries) {
    try {
      console.log(`Executing: ${query}`);
      await client.execute(query);
      console.log('Success');
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('Column already exists, skipping.');
      } else {
        console.error(`Error: ${error.message}`);
      }
    }
  }

  process.exit(0);
}

migrate();
