import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ランキングを取得したいセッションタイプを定義
const sessionTypes = ['time_attack1.json', 'time_attack2.json', 'time_attack3.json', 'time_attack4.json'];

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    console.log(`API executed at: ${generatedAt}`); // Vercelのログで確認用

    const queries = sessionTypes.map(sessionType => {
      const query = `
        SELECT
          DENSE_RANK() OVER (ORDER BY T."bestTime" ASC) as "rank",
          U.id AS "userId", -- ★ユーザーIDも取得するように追加
          U.name AS "userName",
          T."bestTime"
        FROM
          "TimeAttackBestTime" T
        LEFT JOIN
          "User" U ON T."userId" = U.id
        WHERE
          T."sessionType" = $1
        ORDER BY
          T."bestTime" ASC
        LIMIT 100;
      `;
      console.log(`[API DB] Preparing query for sessionType: ${sessionType}`);
      return sql.query(query, [sessionType]);
    });

    const queryResults = await Promise.all(queries);

    console.log('[API DB] Raw results from Promise.all:', JSON.stringify(queryResults, null, 2));

    const allRankings = sessionTypes.reduce((acc: { [key: string]: any[] }, sessionType, index) => {
      acc[sessionType] = queryResults[index].rows;
      return acc;
    }, {});

    console.log('[API RESPONSE] Final rankings object being sent:', JSON.stringify(allRankings, null, 2));

    return NextResponse.json({
        generatedAt: generatedAt,
        rankings: allRankings
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error(`All Ranking API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}