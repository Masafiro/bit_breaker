import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LIMIT = 50;

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    const cacheBusterComment = `-- Cache-Buster: ${Date.now()}`;

    const query = `
      SELECT
        RANK() OVER (
          ORDER BY
            COUNT(P."problemId") DESC,
            COUNT(CASE WHEN P.status = 'SOLVED_MINIMUM' THEN 1 END) DESC
        ) as "rank",
        U.id AS "userId",
        U.name AS "userName",
        COUNT(P."problemId") AS "solvedCount",
        -- ★この行が重要です
        COUNT(CASE WHEN P.status = 'SOLVED_MINIMUM' THEN 1 END) AS "solvedMinimumCount"
      FROM "ProblemBestResult" P
      LEFT JOIN "User" U ON P."userId" = U.id
      WHERE P.status IN ('SOLVED', 'SOLVED_MINIMUM')
      GROUP BY U.id, U.name
      ORDER BY "rank" ASC
      LIMIT ${LIMIT};
      ${cacheBusterComment}
    `;

    const result = await sql.query(query);

    return NextResponse.json({
      generatedAt: generatedAt,
      ranking: result.rows.map(row => ({
        rank: row.rank,
        userId: row.userId,
        userName: row.userName,
        solvedCount: Number(row.solvedCount),
        // ★レスポンスに solvedMinimumCount を含めます
        solvedMinimumCount: Number(row.solvedMinimumCount)
      }))
    });

  } catch (error) {
    console.error(`Problem Ranking API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}