import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  // 【注意点】
  // このAPIは、あなたの現在のフロントエンドの呼び出し方に合わせて、
  // 常に1種類のランキングしか返しません。
  // ここでは例として 'time_attack1.json' のランキングを取得します。
  const sessionType = 'time_attack1.json';

  try {
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

    const rankingData = await sql.query(query, [sessionType]);
    return NextResponse.json(rankingData);

  } catch (error) {
    console.error(`Ranking API error for ${sessionType}:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}