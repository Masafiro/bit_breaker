import { neon } from '@neondatabase/serverless';
import { Pool, QueryResult } from 'pg';

// Vercelの環境変数を見て、本番/プレビュー環境か、ローカル開発環境かを判断
const isVercel = !!process.env.VERCEL_ENV;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// どちらのクライアントも .query メソッドを持つように、型をanyで許容
let dbClient: { query: (text: string, params?: any[]) => Promise<any> };

if (isVercel) {
  console.log("Using Neon serverless driver for Vercel environment.");
  // Vercel上では、@neondatabase/serverless を使う
  dbClient = {
    query: (text, params) => neon(connectionString).query(text, params),
  };
} else {
  console.log("Using pg driver for local development.");
  // ローカル開発では、pgの接続プールを作成
  dbClient = new Pool({ connectionString });
}

// どちらのクライアントを使っても、常に{ rows: [...] }という形で結果が返るように
// 処理を共通化するラッパー関数
export const sql = {
  query: async (text: string, params: any[] = []): Promise<{ rows: any[] }> => {
    const result = await dbClient.query(text, params);
    
    // pgドライバは{ rows: [...] }を返し、neonドライ
    // バは直接[...]（配列）を返すことがあるため、
    // 常に{ rows: [...] }の形に統一して返す。
    if (Array.isArray(result)) {
      return { rows: result };
    }
    return result;
  }
};