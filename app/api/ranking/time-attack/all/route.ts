import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const sessionTypes = ['time_attack1.json', 'time_attack2.json', 'time_attack3.json', 'time_attack4.json'];

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();

    // ★★★ これがキャッシュバスティングです ★★★
    // 毎回ユニークなクエリを生成するために、現在時刻をコメントとして埋め込む
    const cacheBusterComment = `-- Cache-Buster: ${Date.now()}`;

    // --- ユーザー情報の取得クエリ ---
    const usersQuery = `
      SELECT id, name FROM "User";
      ${cacheBusterComment}
    `;

    // --- ランキング取得クエリ ---
    // Promise.allを使うために、一度に全てのクエリを準備します
    const rankingQueries = sessionTypes.map(sessionType => {
      const query = `
        SELECT
          DENSE_RANK() OVER (ORDER BY T."bestTime" ASC) as "rank",
          U.id AS "userId",
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
        ${cacheBusterComment}
      `;
      return sql.query(query, [sessionType]);
    });
    
    // --- データベースへの問い合わせ ---
    // ユーザー情報と、全ランキングの情報を並行して取得
    const [userResults, ...timeAttackResults] = await Promise.all([
      sql.query(usersQuery),
      ...rankingQueries
    ]);

    // --- JavaScriptでのデータ結合 ---
    const userMap = new Map<string, string>();
    userResults.rows.forEach(user => {
      userMap.set(user.id, user.name);
    });

    const allRankings = sessionTypes.reduce((acc: { [key: string]: any[] }, sessionType, index) => {
      // 注意: userResultsが0番目なので、timeAttackResultsのインデックスと合わせる
      const correspondingResult = timeAttackResults[index];
      acc[sessionType] = correspondingResult.rows;
      return acc;
    }, {});
    
    return NextResponse.json({
      generatedAt: generatedAt,
      rankings: allRankings
    });

  } catch (error) {
    console.error(`All Ranking API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}