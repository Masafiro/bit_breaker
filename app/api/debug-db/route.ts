import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Executing DB debug query...");
    
    // 現在接続しているデータベースの情報を取得する特別なクエリ
    const query = `
      SELECT 
        current_database() as db_name, 
        setting as branch_id 
      FROM 
        pg_settings 
      WHERE 
        name = 'neon.branch_id';
    `;
    
    const result = await sql.query(query);
    const dbInfo = result.rows[0];

    console.log("DB Info from Vercel:", dbInfo);
    
    return NextResponse.json(dbInfo);

  } catch (error) {
    console.error(`DB Debug API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}