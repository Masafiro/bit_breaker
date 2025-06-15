'use client';

import { useState, useEffect, useCallback } from 'react'; // ★ useCallback をインポート
import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';

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
  'total': RankEntry[]; 
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>{title}</h2>
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'center', width: '50px' }}>順位</th>
            <th style={{ textAlign: 'left' }}>名前</th>
            <th style={{ textAlign: 'right' }}>タイム</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((entry) => (
              <tr key={entry.userId}>
                <td style={{ textAlign: 'center' }}>{entry.rank}位</td>
                <td style={{ textAlign: 'left', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>{entry.userName || 'unknown'}</strong></td>
                <td style={{ textAlign: 'right' }}>{formatTime(entry.bestTime)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>
                このモードのランキングはまだありません。
              </td>
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
  }, []);

  useEffect(() => {
    fetchAllRankings();
  }, [fetchAllRankings]);

  console.log('--- Current State "data" is ---:', data);
  console.log('--- Current State "data.rankings" is ---:', data?.rankings);
  
  if (error) return <div>エラー: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', position: 'relative', fontSize: '2.5rem' }}>
        <h1><strong>タイムアタック ランキング</strong></h1>
      </div>

      {/* 更新ボタンと時刻表示の行 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
        {data?.generatedAt && (
          <p style={{ fontSize: '0.8rem', color: '#888888', margin: 0 }}>
            データ取得時刻: {new Date(data.generatedAt).toLocaleString('ja-JP')}
          </p>
        )}
        <button 
          onClick={fetchAllRankings} 
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: 'var(--foreground)',
            opacity: 0.7,
          }}
          title="ランキングを更新"
        >
          {isLoading 
            ? <span style={{ fontSize: '0.8rem' }}>更新中...</span> 
            : <RefreshCcw size={20} />
          }
        </button>
      </div>

      <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#888888' }}>
          ※不適切なユーザー名は予告なくBANの対象となります
        </p>
      </div>
      
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
          <RankingList title="総合 🏆" data={data?.rankings?.['total'] || []} />
        </div>
      )}

      <br />
    </div>
  );
}