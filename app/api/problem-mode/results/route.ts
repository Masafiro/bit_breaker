import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // 1. ログイン中のユーザー情報を取得
  const user = await stackServerApp.getUser();
  if (!user || !user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    // 2. フロントエンドから送られてきたデータを取得
    const { sessionId, problemNumber, status } = await req.json();

    // 3. 必須データが揃っているかチェック
    if (!sessionId || !problemNumber || !status) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 4. 同じセッション・同じ問題番号のデータがあれば更新、なければ新規作成するSQL（UPSERT）
    //    これにより、一度"SOLVED"になった問題を後から"SOLVED_MINIMUM"に更新できる
    const query = `
      INSERT INTO "ProblemResult" (id, "sessionId", "problemNumber", "status")
      VALUES (gen_random_uuid(), $1, $2, $3)
      ON CONFLICT ("sessionId", "problemNumber")
      DO UPDATE SET "status" = EXCLUDED.status;
    `;
    
    await sql.query(query, [sessionId, problemNumber, status]);

    return NextResponse.json({ message: 'Result saved successfully' }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}