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

    // "Get or Create"ロジック（ユーザーがDBに存在しなかった場合のため）
    const userInDbResult = await sql('SELECT id FROM "User" WHERE id = $1', [userId]);
    if (userInDbResult.length === 0) {
      await sql('INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3)', [userId, user.primaryEmail, user.displayName]);
    }
    
    const { problemNumber, status } = await req.json();

    // ステータスの優劣を定義 (SOLVED_MINIMUMが一番良い)
    const statusOrder = {
      'SOLVED': 1,
      'SOLVED_MINIMUM': 2
    };

    const newStatusOrder = statusOrder[status as keyof typeof statusOrder] || 0;

    const query = `
      INSERT INTO "ProblemBestResult" ("userId", "problemNumber", "status", "updatedAt")
      VALUES ($1, $2, $3, now())
      ON CONFLICT ("userId", "problemNumber")
      DO UPDATE SET 
        "status" = EXCLUDED.status,
        "updatedAt" = now()
      WHERE 
        -- 新しいステータスの方が良い場合のみ更新する
        -- "SOLVED_MINIMUM"は常に更新、"SOLVED"は既存が"SOLVED"でない場合のみ
        CASE 
          WHEN "ProblemBestResult".status = 'SOLVED_MINIMUM' THEN false
          WHEN "ProblemBestResult".status = 'SOLVED' AND EXCLUDED.status = 'SOLVED_MINIMUM' THEN true
          ELSE false
        END;
    `;
    
    // 別の書き方：数値で比較する
    const queryWithRank = `
      INSERT INTO "ProblemBestResult" ("userId", "problemNumber", "status", "updatedAt")
      VALUES ($1, $2, $3, now())
      ON CONFLICT ("userId", "problemNumber")
      DO UPDATE SET 
        "status" = EXCLUDED.status,
        "updatedAt" = now()
      WHERE 
        -- 新しいステータスの方がランクが高い場合のみ更新する
        (CASE EXCLUDED.status WHEN 'SOLVED' THEN 1 WHEN 'SOLVED_MINIMUM' THEN 2 ELSE 0 END) > 
        (CASE "ProblemBestResult".status WHEN 'SOLVED' THEN 1 WHEN 'SOLVED_MINIMUM' THEN 2 ELSE 0 END);
    `;


    await sql(queryWithRank, [userId, problemNumber, status]);
    return NextResponse.json({ message: 'Result submitted successfully' });

  } catch (error) {
    console.error('Submit result API error:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}