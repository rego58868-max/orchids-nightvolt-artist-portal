import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    const result = await client.execute("PRAGMA table_info(artists);");
    console.log("Current columns:", result.rows.map(r => r.name));
    
    const columnsToAdd = [
      { name: "surname", type: "TEXT" },
      { name: "artist_name", type: "TEXT" },
      { name: "is_approved", type: "INTEGER DEFAULT 0" },
      { name: "email_verified", type: "INTEGER DEFAULT 0" },
      { name: "verification_code", type: "TEXT" },
      { name: "access_request_message", type: "TEXT" }
    ];

    const currentColumns = result.rows.map(r => String(r.name));

    for (const col of columnsToAdd) {
      if (!currentColumns.includes(col.name)) {
        console.log(`Adding column ${col.name}...`);
        try {
          await client.execute(`ALTER TABLE artists ADD COLUMN ${col.name} ${col.type};`);
        } catch (e) {
          console.error(`Error adding ${col.name}:`, e.message);
        }
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }
    
    await client.execute("UPDATE artists SET plan = 'none' WHERE plan IS NULL OR plan = 'basic';");
    console.log("Success!");
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
