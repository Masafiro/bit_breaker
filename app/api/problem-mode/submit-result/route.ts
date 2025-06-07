import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { sessionType, problemNumber, status } = await req.json();

  // sessionを作成しつつ、problemの結果も保存するロジックが必要
  // ここでは簡略化のため、まずProblemResultを保存する部分のみを記述します
  // ★TODO: sessionの作成と管理も実装する必要がある

  const query = `
    INSERT INTO "ProblemResult" (id, "sessionId", "problemNumber", "status")
    VALUES (gen_random_uuid(), $1, $2, $3)
    ON CONFLICT ("sessionId", "problemNumber")
    DO UPDATE SET "status" = EXCLUDED.status;
  `;
  
  // ★TODO: sessionIdをどうやって取得・管理するかを決める
  const fakeSessionId = "some-session-id-for-now"; 

  try {
    await sql(query, [fakeSessionId, problemNumber, status]);
    return NextResponse.json({ message: 'Result saved' });
  } catch (error) {
    console.error('Submit result API error:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}