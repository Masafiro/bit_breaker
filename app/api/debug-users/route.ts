import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// Vercelのキャッシュを無効化するおまじない
export const dynamic = 'force-dynamic';

export async function GET() {
  const generatedAt = new Date().toISOString();
  console.log(`[DEBUG API] /api/debug-users executed at: ${generatedAt}`);

  try {
    const query = 'SELECT id, name FROM "User";';
    const result = await sql.query(query);

    // 取得したデータと、実行時刻をJSONで返す
    return NextResponse.json({
      generatedAt: generatedAt,
      userCount: result.rows.length,
      users: result.rows,
    });

  } catch (error) {
    console.error(`Debug Users API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}