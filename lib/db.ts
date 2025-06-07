import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// SQLクエリを実行するための関数をエクスポート
export const sql = async (query: string, params: any[] = []) => {
  const { rows } = await pool.query(query, params);
  return rows;
};