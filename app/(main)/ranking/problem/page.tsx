// app/ranking/problem/page.tsx (修正後の全文)

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';

// ランキングデータの型定義
interface RankEntry {
  rank: string;
  userId: string;
  userName: string;
  solvedCount: number;
  solvedMinimumCount: number; // ★このプロパティを受け取る
}

export default function ProblemRankingPage() {
  const [data, setData] = useState<{ generatedAt: string, ranking: RankEntry[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblemRanking = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `/api/ranking/problem?timestamp=${new Date().getTime()}`;
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました。');
      }
      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーです。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblemRanking();
  }, [fetchProblemRanking]);

  if (error) return <div>エラー: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', position: 'relative', fontSize: '2.5rem' }}>
        <h1><strong>熟考 ランキング</strong></h1>
      </div>

      {/* 更新ボタンと時刻表示の行 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
        {data?.generatedAt && (
          <p style={{ fontSize: '0.8rem', color: '#888888', margin: 0 }}>
            データ取得時刻: {new Date(data.generatedAt).toLocaleString('ja-JP')}
          </p>
        )}
        <button 
          onClick={fetchProblemRanking} 
          disabled={isLoading}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--foreground)', opacity: 0.7 }}
          title="ランキングを更新"
        >
          {isLoading ? <span style={{ fontSize: '0.8rem' }}>更新中...</span> : <RefreshCcw size={20} />}
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
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
                <table className="custom-table">
                <thead>
                    <tr>
                    <th style={{ textAlign: 'center', width: '60px' }}>順位</th>
                    <th style={{ textAlign: 'left' }}>名前</th>
                    <th style={{ textAlign: 'right', width: '180px' }}>クリア問題数</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.ranking && data.ranking.length > 0 ? (
                    data.ranking.map((entry) => (
                        <tr key={entry.userId}>
                        <td style={{ textAlign: 'center' }}>{entry.rank}位</td>
                        <td style={{ textAlign: 'left', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <strong>{entry.userName || 'unknown'}</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {entry.solvedCount} 問
                          <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '0.5rem' }}>
                            (最短 {entry.solvedMinimumCount}問)
                          </span>
                        </td>
                        {/* ▲▲▲ ここまでが修正箇所です ▲▲▲ */}
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>
                        まだランキングデータがありません。
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>
      )}
      <br />
    </div>
  );
}