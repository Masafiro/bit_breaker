import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user?.id) {
    return NextResponse.json({}); // 未ログイン時は空のオブジェクト
  }

  // ★新しい"TimeAttackBestTime"テーブルから記録を取得する
  const query = `
    SELECT
      "sessionType",
      "bestTime"
    FROM
      "TimeAttackBestTime"
    WHERE
      "userId" = $1;
  `;
  
  try {
    const results = await sql(query, [user.id]);

    // フロントエンドで扱いやすいように、{ "time_attack1.json": 17840, ... } の形に変換
    const bestTimesMap = results.reduce((acc, row) => {
      acc[row.sessionType] = row.bestTime;
      return acc;
    }, {});

    return NextResponse.json(bestTimesMap);
  } catch (error) {
    console.error('Best times API error:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}