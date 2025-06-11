'use client';

import { useState, useEffect, useCallback } from 'react'; // ★ useCallback をインポート
import Link from 'next/link';

// ランキングデータの型定義
interface RankEntry {
  rank: string;
  userId: string;
  userName: string;
  bestTime: number;
}

// 4つのランキングデータを保持するstateの型
interface AllRankings {
  'time_attack1.json': RankEntry[];
  'time_attack2.json': RankEntry[];
  'time_attack3.json': RankEntry[];
  'time_attack4.json': RankEntry[];
}

// ランキングリストを表示するための再利用可能なコンポーネント
const RankingList = ({ title, data }: { title: string, data: RankEntry[] }) => {
  const formatTime = (milliseconds: number) => {
    if (typeof milliseconds !== 'number' || isNaN(milliseconds)) return '記録なし';
    const seconds = milliseconds / 1000;
    return `${seconds.toFixed(2)}秒`;
  };

  return (
    <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
      <h2>{title}</h2>
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
              <tr key={entry.userId}>
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
  const [data, setData] = useState<{ generatedAt: string, rankings: AllRankings } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ★ データを取得するロジックを、useCallbackで囲んで独立した関数にする
  const fetchAllRankings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `/api/ranking/time-attack/all?timestamp=${new Date().getTime()}`;
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました。');
      }
      const responseData = await response.json();
      console.log('--- API Response Data ---:', responseData);
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーです。');
    } finally {
      setIsLoading(false);
    }
  }, []); // 依存配列は空でOK

  // ページが最初に読み込まれた時に、一度だけデータを取得する
  useEffect(() => {
    fetchAllRankings();
  }, [fetchAllRankings]);

  console.log('--- Current State "data" is ---:', data);
  console.log('--- Current State "data.rankings" is ---:', data?.rankings);
  
  if (error) return <div>エラー: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1>タイムアタック ランキング</h1>
        <button onClick={fetchAllRankings} disabled={isLoading}>
          {isLoading ? '更新中...' : 'ランキングを更新'}
        </button>
      </div>

      {/* ★ APIから返ってきた生成時刻を表示 */}
      {data?.generatedAt && <p>データ生成時刻: {new Date(data.generatedAt).toLocaleString('ja-JP')}</p>}
      
      {isLoading ? (
        <p>読み込み中...</p>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          width: '100%',
        }}>
          <RankingList title="Easy" data={data?.rankings?.['time_attack1.json'] || []} />
          <RankingList title="Normal" data={data?.rankings?.['time_attack2.json'] || []} />
          <RankingList title="Hard" data={data?.rankings?.['time_attack3.json'] || []} />
          <RankingList title="Extra" data={data?.rankings?.['time_attack4.json'] || []} />
        </div>
      )}

      <br />
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}