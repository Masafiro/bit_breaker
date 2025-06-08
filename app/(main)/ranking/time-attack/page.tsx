'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ランキングデータの型定義
interface RankEntry {
  rank: string;
  userName: string;
  bestTime: number;
}

// 3つのランキングデータを保持するstateの型
interface AllRankings {
  'time_attack1.json': RankEntry[];
  'time_attack2.json': RankEntry[];
  'time_attack3.json': RankEntry[];
}

// ランキングリストを表示するための再利用可能なコンポーネント
const RankingList = ({ title, data }: { title: string, data: RankEntry[] }) => {
  const formatTime = (milliseconds: number) => {
    if (typeof milliseconds !== 'number' || isNaN(milliseconds)) return '記録なし';
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = milliseconds % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div style={{ flex: 1, padding: '0 1rem' }}>
      <h2>{title}</h2>
      <ol>
        {data && data.length > 0 ? (
          data.map((entry) => (
            <li key={`${entry.rank}-${entry.userName}`}>
              <span>{entry.rank}位: </span>
              <strong>{entry.userName || '名無しさん'}</strong>
              <span> - {formatTime(entry.bestTime)}</span>
            </li>
          ))
        ) : (
          <p>このモードのランキングはまだありません。</p>
        )}
      </ol>
    </div>
  );
};


export default function AllTimeAttackRankingsPage() {
  const [allRankings, setAllRankings] = useState<AllRankings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ページが読み込まれたら、新しいAPIを叩いて全ランキングデータを取得
    const fetchAllRankings = async () => {
      try {
        const response = await fetch('/api/ranking/time-attack/all', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('ランキングの取得に失敗しました。');
        }
        const data = await response.json();
        setAllRankings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーです。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRankings();
  }, []);

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>タイムアタック ランキング</h1>
      
      {/* 3つのランキングを横に並べて表示 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <RankingList title="5桁 1手 10問" data={allRankings?.['time_attack1.json'] || []} />
        <RankingList title="5桁 2手 10問" data={allRankings?.['time_attack2.json'] || []} />
        <RankingList title="5桁 3手 10問" data={allRankings?.['time_attack3.json'] || []} />
      </div>

      <br />
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}