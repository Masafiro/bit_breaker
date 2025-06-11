import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// キャッシュを完全に無効化する
export const dynamic = 'force-dynamic';

export async function GET() {
  const generatedAt = new Date().toISOString();
  console.log(`[DEBUG API] /api/debug-scores executed at: ${generatedAt}`);

  try {
    // ★ あなたがリクエストした、TimeAttackBestTimeテーブルを直接見るクエリ
    const query = 'SELECT "userId", "sessionType", "bestTime" FROM "TimeAttackBestTime";';
    
    const result = await sql.query(query);

    // 取得したデータと、実行時刻をJSONで返す
    return NextResponse.json({
      generatedAt: generatedAt,
      scoreCount: result.rows.length,
      scores: result.rows,
    });

  } catch (error) {
    console.error(`Debug Scores API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}