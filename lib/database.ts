import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let initialized = false;

async function initializeDb() {
  if (initialized) return;
  
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        title TEXT,
        description TEXT,
        date TEXT NOT NULL,
        "createdAt" TEXT NOT NULL,
        "qrCodeData" TEXT,
        "isPublic" INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT 'current-user',
        "firstName" TEXT,
        "lastName" TEXT,
        "birthDate" TEXT,
        email TEXT,
        phone TEXT,
        profession TEXT,
        "zipCode" TEXT,
        city TEXT,
        country TEXT,
        "cryptoSignature" TEXT,
        "updatedAt" TEXT
      );
    `);
    initialized = true;
  } finally {
    client.release();
  }
}

// Convert SQLite-style ? placeholders to PostgreSQL-style $1, $2, etc.
function convertPlaceholders(query: string): string {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

// Database wrapper to maintain compatibility with existing API routes
export async function getDb() {
  await initializeDb();
  
  return {
    async all(query: string, params: unknown[] = []) {
      const pgQuery = convertPlaceholders(query);
      const result = await pool.query(pgQuery, params);
      return result.rows;
    },
    async get(query: string, params: unknown[] = []) {
      const pgQuery = convertPlaceholders(query);
      const result = await pool.query(pgQuery, params);
      return result.rows[0] || null;
    },
    async run(query: string, params: unknown[] = []) {
      const pgQuery = convertPlaceholders(query);
      await pool.query(pgQuery, params);
    }
  };
}
