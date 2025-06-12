import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LIMIT = 50; // ランキングの上限数
const sessionTypes = ['time_attack1.json', 'time_attack2.json', 'time_attack3.json', 'time_attack4.json'];

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();

    // ★★★ これがキャッシュバスティングです ★★★
    // 毎回ユニークなクエリを生成するために、現在時刻をコメントとして埋め込む
    const cacheBusterComment = `-- Cache-Buster: ${Date.now()}`;

    // --- 各モードのランキング取得クエリ ---
    const rankingQueries = sessionTypes.map(sessionType => {
      const query = `
        SELECT
          DENSE_RANK() OVER (ORDER BY T."bestTime" ASC) as "rank",
          U.id AS "userId",
          U.name AS "userName",
          T."bestTime"
        FROM "TimeAttackBestTime" T
        LEFT JOIN "User" U ON T."userId" = U.id
        WHERE T."sessionType" = $1
        ORDER BY T."bestTime" ASC
        LIMIT ${LIMIT};
        ${cacheBusterComment}
      `;
      return sql.query(query, [sessionType]);
    });

    // ★ 総合ランキング取得クエリを追加
    const totalRankingQuery = `
      SELECT
        DENSE_RANK() OVER (ORDER BY SUM(T."bestTime") ASC) as "rank",
        U.id AS "userId",
        U.name AS "userName",
        SUM(T."bestTime") AS "bestTime" -- フロントの型に合わせて "bestTime" というカラム名で合計タイムを返す
      FROM "TimeAttackBestTime" T
      JOIN "User" U ON T."userId" = U.id
      WHERE T."sessionType" IN ($1, $2, $3, $4)
      GROUP BY U.id, U.name
      -- HAVING句で、4つのモード全てに参加しているユーザーのみを絞り込む
      HAVING COUNT(DISTINCT T."sessionType") = 4
      ORDER BY "bestTime" ASC
      LIMIT ${LIMIT};
      ${cacheBusterComment}
    `;
    const totalRankingPromise = sql.query(totalRankingQuery, sessionTypes);

    // --- データベースへの問い合わせ (並列実行) ---
    // Promise.allで、個別のランキングと総合ランキングを同時に取得
    const allResults = await Promise.all([
      ...rankingQueries,
      totalRankingPromise
    ]);
    const totalResult = allResults[allResults.length - 1];
    const individualResults = allResults.slice(0, -1);

    // --- 結果の整形 ---
    const allRankings: { [key: string]: any[] } = {};
    
    // 各モードのランキングを格納
    sessionTypes.forEach((sessionType, index) => {
      allRankings[sessionType] = individualResults[index].rows;
    });

    // ★ 総合ランキングの結果を 'total' というキーで格納
    allRankings['total'] = totalResult.rows.map(row => ({
      ...row,
      bestTime: Number(row.bestTime) // bestTimeを文字列から数値へ明示的に変換
    }));
    
    return NextResponse.json({
      generatedAt: generatedAt,
      rankings: allRankings
    });

  } catch (error) {
    console.error(`All Ranking API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}