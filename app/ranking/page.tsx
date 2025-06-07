'use client';

import { useState, useEffect } from 'react';

// ランキングデータの型を定義
interface RankEntry {
  userName: string;
  totalTime: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ページが読み込まれたら、APIを叩いてランキングデータを取得
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/ranking/time-attack');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました。');
        }
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーです。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []); // 空の配列を渡すことで、最初の1回だけ実行される

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  // タイムを「分:秒.ミリ秒」形式にフォーマットする関数
  const formatTime = (milliseconds: number) => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = milliseconds % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div>
      <h1>タイムアタックランキング</h1>
      <ol>
        {ranking.map((entry, index) => (
          <li key={index}>
            <span>{index + 1}位: </span>
            <strong>{entry.userName || '名無しさん'}</strong>
            <span> - {formatTime(entry.totalTime)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}