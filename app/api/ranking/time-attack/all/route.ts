import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ランキングを取得したいセッションタイプを定義
const sessionTypes = ['time_attack1.json', 'time_attack2.json', 'time_attack3.json', 'time_attack4.json'];

export async function GET() {
  try {
    const queries = sessionTypes.map(sessionType => {
      const query = `
        SELECT
          DENSE_RANK() OVER (ORDER BY T."bestTime" ASC) as "rank",
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
      return sql.query(query, [sessionType]);
    });

    const results = await Promise.all(queries);

    // ★★★ ここが重要な修正点 ★★★
    // フロントエンドで扱いやすいように、結果の.rowsプロパティを抽出して整形する
    const allRankings = {
      [sessionTypes[0]]: results[0].rows, // .rows を追加
      [sessionTypes[1]]: results[1].rows, // .rows を追加
      [sessionTypes[2]]: results[2].rows, // .rows を追加
      [sessionTypes[3]]: results[3].rows, // .rows を追加
    };

    return NextResponse.json(allRankings);

  } catch (error) {
    console.error(`All Ranking API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}