import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack"; // あなたの認証ヘルパー
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    // 1. ログインしているユーザーのIDを取得
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // 2. フロントエンドから新しい名前を受け取る
    const { displayName } = await req.json();
    if (typeof displayName !== 'string' || displayName.length < 1) {
      return NextResponse.json({ message: '表示名が必要です。' }, { status: 400 });
    }

    // 3. NeonデータベースのUserテーブルを直接更新する
    const query = `
      UPDATE "User"
      SET "name" = $1
      WHERE "id" = $2;
    `;
    await sql.query(query, [displayName, userId]);

    return NextResponse.json({ message: '名前を更新しました。' });

  } catch (error) {
    console.error('Update name API error:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}