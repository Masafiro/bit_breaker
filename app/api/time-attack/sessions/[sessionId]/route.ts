import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { sessionId: string } }) {
  // 1. ログインユーザー情報を取得
  const user = await stackServerApp.getUser();
  if (!user || !user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  
  // 2. URLからセッションIDを、リクエストボディから合計タイムを取得
  const { sessionId } = params;
  const { totalTime } = await req.json();

  if (typeof totalTime !== 'number') {
    return NextResponse.json({ message: 'Invalid totalTime' }, { status: 400 });
  }

  // 3. ログイン中のユーザー自身のセッションのみを更新する
  //    (他人のセッションを書き換えられないように、WHERE句でuserIdもチェックする)
  //    また、新しいタイムの方が速い（小さい）場合のみ記録を更新する
  const query = `
    UPDATE "TimeAttackSession"
    SET "totalTime" = $1
    WHERE 
      id = $2 AND 
      "userId" = $3 AND
      ("totalTime" IS NULL OR "totalTime" > $1); -- 記録がまだないか、新しい記録の方が速い場合
  `;

  try {
    await sql(query, [totalTime, sessionId, userId]);
    return NextResponse.json({ message: 'Session updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}