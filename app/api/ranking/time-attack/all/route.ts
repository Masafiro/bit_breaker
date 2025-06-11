import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// このAPIは認証を必要としない公開ランキングなので、userの取得は不要

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    console.log(`API executed at: ${generatedAt}`);

    // ★ ステップ1：2つのテーブルから、それぞれ生のデータを取得する
    const timeAttackQuery = `SELECT "userId", "sessionType", "bestTime" FROM "TimeAttackBestTime" ORDER BY "bestTime" ASC;`;
    const usersQuery = `SELECT id, name FROM "User";`;

    const [timeAttackResults, userResults] = await Promise.all([
      sql.query(timeAttackQuery),
      sql.query(usersQuery)
    ]);

    // ★ ステップ2：ユーザーIDをキーにした、名前の検索マップを作成する
    const userMap = new Map<string, string>();
    userResults.rows.forEach(user => {
      userMap.set(user.id, user.name);
    });

    // ★ ステップ3：JavaScriptでランキングデータを組み立てる
    const allRankings: { [key: string]: any[] } = {
      'time_attack1.json': [],
      'time_attack2.json': [],
      'time_attack3.json': [],
      'time_attack4.json': [],
    };

    const rankCounters: { [key: string]: number } = {};

    timeAttackResults.rows.forEach(score => {
      const sessionType = score.sessionType;
      if (allRankings[sessionType] && allRankings[sessionType].length < 100) {
        // ランクカウンターをインクリメント
        rankCounters[sessionType] = (rankCounters[sessionType] || 0) + 1;

        allRankings[sessionType].push({
          rank: String(rankCounters[sessionType]),
          userId: score.userId,
          userName: userMap.get(score.userId) || 'unknown', // userMapから名前を検索
          bestTime: score.bestTime,
        });
      }
    });
    
    return NextResponse.json({
      generatedAt: generatedAt,
      rankings: allRankings
    });

  } catch (error) {
    console.error(`All Ranking API error:`, error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}