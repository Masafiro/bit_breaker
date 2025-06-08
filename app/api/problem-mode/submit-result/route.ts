import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const userInDbResult = await sql.query('SELECT id FROM "User" WHERE id = $1', [userId]);
    if (userInDbResult.rows.length === 0) {
      await sql.query('INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3)', [userId, user.primaryEmail, user.displayName]);
    }
    
    // ★ problemNumberの代わりにproblemIdを受け取る
    const { problemId, status } = await req.json();

    const query = `
      INSERT INTO "ProblemBestResult" ("userId", "problemId", "status", "updatedAt")
      VALUES ($1, $2, $3, now())
      ON CONFLICT ("userId", "problemId") -- ★ ON CONFLICTの対象も変更
      DO UPDATE SET 
        "status" = EXCLUDED.status,
        "updatedAt" = now()
      WHERE 
        (CASE EXCLUDED.status WHEN 'SOLVED' THEN 1 WHEN 'SOLVED_MINIMUM' THEN 2 ELSE 0 END) > 
        (CASE "ProblemBestResult".status WHEN 'SOLVED' THEN 1 WHEN 'SOLVED_MINIMUM' THEN 2 ELSE 0 END);
    `;

    await sql.query(query, [userId, problemId, status]);
    return NextResponse.json({ message: 'Result submitted successfully' });

  } catch (error) {
    console.error('Submit result API error:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}