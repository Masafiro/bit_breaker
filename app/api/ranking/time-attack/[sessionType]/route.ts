import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ★★★ ここが重要な修正点 ★★★
// 関数の2番目の引数を、分割代入せずに context という名前で受け取る
export async function GET(
  req: NextRequest,
  context: { params: { sessionType: string } }
) {
  try {
    // ★ context オブジェクトから params を取り出し、さらに sessionType を取り出す
    const { sessionType } = context.params;

    const query = `
      SELECT
        DENSE_RANK() OVER (ORDER BY T."bestTime" ASC) as "rank",
        U.name AS "userName",
        T."bestTime"
      FROM
        "TimeAttackBestTime" T
      JOIN
        "User" U ON T."userId" = U.id
      WHERE
        T."sessionType" = $1
      ORDER BY
        T."bestTime" ASC
      LIMIT 100;
    `;

    const rankingData = await sql(query, [sessionType]);

    return NextResponse.json(rankingData);

  } catch (error) {
    // contextからsessionTypeを安全に取り出す
    const sessionTypeForError = context?.params?.sessionType || 'unknown';
    console.error(`Ranking API error for ${sessionTypeForError}:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}