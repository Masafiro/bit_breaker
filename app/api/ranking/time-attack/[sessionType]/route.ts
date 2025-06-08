import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionType: string } }
) {
  try {
    // URLからセッションタイプを取得
    const { sessionType } = params;

    // ランキングを取得するためのSQLクエリ
    // DENSE_RANK() を使うことで、同タイムの場合に同じ順位をつけ、次の順位を飛ばさないようにする
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
    console.error(`Ranking API error for ${params.sessionType}:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}