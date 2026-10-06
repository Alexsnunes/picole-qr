import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL não configurada. Configure a variável de ambiente.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : { rejectUnauthorized: false }
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
