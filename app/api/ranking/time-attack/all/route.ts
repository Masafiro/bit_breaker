import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// ランキングを取得したいセッションタイプを定義
const sessionTypes = ['time_attack1.json', 'time_attack2.json', 'time_attack3.json'];

export async function GET() {
  try {
    // 各セッションタイプのランキング取得クエリを準備
    const queries = sessionTypes.map(sessionType => {
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
        LIMIT 50; -- 上位10件に絞るなど、件数を調整
      `;
      return sql(query, [sessionType]);
    });

    // 3つのクエリを並行して実行し、すべての結果を待つ
    const results = await Promise.all(queries);

    // フロントエンドで扱いやすいように、結果を整形
    const allRankings = {
      [sessionTypes[0]]: results[0], // "time_attack1.json": [...]
      [sessionTypes[1]]: results[1], // "time_attack2.json": [...]
      [sessionTypes[2]]: results[2], // "time_attack3.json": [...]
    };

    return NextResponse.json(allRankings);

  } catch (error) {
    console.error(`All Ranking API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}