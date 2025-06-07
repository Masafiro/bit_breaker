import { sql } from '@/lib/db'; // 以前作成したDB接続用の関数
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ランキングを取得するためのSQLクエリ
    const rankingQuery = `
      SELECT
        u.name AS "userName",
        s."totalTime"
      FROM
        "TimeAttackSession" s
      JOIN
        "User" u ON s."userId" = u.id
      WHERE
        s."totalTime" IS NOT NULL -- タイムが記録されているセッションのみを対象
      ORDER BY
        s."totalTime" ASC -- タイムが速い順（昇順）に並べる
      LIMIT 100; -- 上位100件を取得
    `;

    // SQLクエリを実行
    const rankingData = await sql(rankingQuery);

    // 取得したデータをJSON形式でフロントエンドに返す
    return NextResponse.json(rankingData);

  } catch (error) {
    console.error('Ranking API error:', error);
    // エラーが発生した場合は、500エラーを返す
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}