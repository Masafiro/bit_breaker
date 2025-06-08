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
    const seconds = milliseconds / 1000;
    return `${seconds.toFixed(2)}秒`;
  };

  return (
    <div style={{ flex: 1, minWidth: '300px' }}>
      <h2>{title}</h2>
      {/* ★ olの代わりにtableタグを使う */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #444' }}>順位</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #444' }}>名前</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #444' }}>タイム</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((entry) => (
              // ★ liの代わりにtr(テーブル行)とtd(テーブルセル)を使う
              <tr key={`${entry.rank}-${entry.userName}`}>
                <td style={{ padding: '8px' }}>{entry.rank}位</td>
                <td style={{ padding: '8px' }}><strong>{entry.userName || 'unknown'}</strong></td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{formatTime(entry.bestTime)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>このモードのランキングはまだありません。</td>
            </tr>
          )}
        </tbody>
      </table>
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
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        gap: '1rem',
        width: '100%',
        marginTop: '2rem'
      }}>
        <RankingList title="5桁 1手 10問" data={allRankings?.['time_attack1.json'] || []} />
        <RankingList title="5桁 2手 10問" data={allRankings?.['time_attack2.json'] || []} />
        <RankingList title="5桁 3手 10問" data={allRankings?.['time_attack3.json'] || []} />
      </div>

      <br />
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}