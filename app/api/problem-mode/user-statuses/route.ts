import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';

interface ProblemStatusRow {
  problemId: string;
  status: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) { return NextResponse.json({}); }
    
    // "Get or Create"は念のため残しておく
    const userInDbResult = await sql.query('SELECT id FROM "User" WHERE id = $1', [user.id]);
    if (userInDbResult.rows.length === 0) {
        await sql.query('INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3)', [user.id, user.primaryEmail, user.displayName]);
    }
    
    // ★ problemNumberの代わりにproblemIdを取得
    const query = `
      SELECT
        "problemId",
        "status"
      FROM
        "ProblemBestResult"
      WHERE
        "userId" = $1;
    `;
    
    const results = await sql.query(query, [user.id]);

    // ★ キーがファイル名になるように変換 { "t1.json": "SOLVED", ... }
    const statusesMap = results.rows.reduce((acc: { [key: string]: string }, row: ProblemStatusRow) => {
      acc[row.problemId] = row.status;
      return acc;
    }, {});

    return NextResponse.json(statusesMap);

  } catch (error) {
    console.error('User statuses API error:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}