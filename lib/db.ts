import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Vercelの環境変数を見て、本番/プレビュー環境か、ローカル開発環境かを判断
const isVercel = !!process.env.VERCEL_ENV;

// ★★★ ここが最後の重要な修正点 ★★★
// Vercel上では直接接続用のURLを、ローカルでは通常のURLを使うように切り替える
const connectionString = isVercel
  ? process.env.DATABASE_URL_UNPOOLED
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Database connection string is not set in environment variables');
}

// 接続クライアントを保持する変数
let dbClient: { query: (text: string, params?: any[]) => Promise<any> };

if (isVercel) {
  console.log("Using Neon serverless driver (UNPOOLED) for Vercel environment.");
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
    const result: any = await dbClient.query(text, params);
    if (Array.isArray(result)) {
      return { rows: result };
    }
    return result;
  }
};