import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // ★★★ ここからが重要な追加ロジック ★★★
    // まず、自分のDBにこのユーザーが存在するか確認する
    const userInDbResult = await sql('SELECT id FROM "User" WHERE id = $1', [userId]);

    // もしDBにユーザーが存在しなければ（検索結果が0件なら）、今ここで作成する
    if (userInDbResult.length === 0) {
      const email = user.primaryEmail; // Stack-Authから取得した情報
      const name = user.displayName;   // Stack-Authから取得した情報
      await sql('INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3)', [userId, email, name]);
      console.log(`User ${userId} was missing and has now been synced to the DB.`);
    }
    // ★★★ ここまで ★★★

    // これで、ユーザーがDBに確実に存在するので、安心してセッションを作成できる
    const newSessionId = uuidv4();
    const sessionQuery = `INSERT INTO "TimeAttackSession" (id, "userId", "createdAt") VALUES ($1, $2, now()) RETURNING id;`;
    const sessionResult = await sql(sessionQuery, [newSessionId, userId]);

    return NextResponse.json({ sessionId: sessionResult[0].id });
    
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json({ message: "データベースエラーが発生しました。" }, { status: 500 });
  }
}