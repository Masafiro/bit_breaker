'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import Link from 'next/link';

// ランキングデータの型を定義
interface RankEntry {
  rank: string; // DENSE_RANK()はbigintを返すことがあるのでstringで受け取るのが安全
  userName: string;
  bestTime: number;
}

// セッションタイプの定義
const sessionTypes = [
  { key: 'time_attack1.json', name: 'Easy' },
  { key: 'time_attack2.json', name: 'Normal' },
  { key: 'time_attack3.json', name: 'Hard' },
  { key: 'time_attack4.json', name: 'Extra' },
];

export default function TimeAttackRankingPage() {
//   const user = useUser();
  const [selectedType, setSelectedType] = useState(sessionTypes[0].key);
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 選択されたセッションタイプが変わるたびに、APIを叩いてデータを再取得
    const fetchRanking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ranking/time-attack/${selectedType}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('ランキングの取得に失敗しました。');
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
  }, [selectedType]); // selectedTypeが変更されたら、このuseEffectが再実行される

  const formatTime = (milliseconds: number) => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = milliseconds % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div>
      <h1>タイムアタック ランキング</h1>
      
      {/* モード切り替えボタン */}
      <div>
        {sessionTypes.map(type => (
          <button 
            key={type.key} 
            onClick={() => setSelectedType(type.key)}
            disabled={selectedType === type.key}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* ランキング表示部分 */}
      {isLoading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p>エラー: {error}</p>
      ) : (
        <ol>
          {ranking.map((entry) => (
            <li key={`${entry.rank}-${entry.userName}`}>
              <span>{entry.rank}位: </span>
              <strong>{entry.userName || 'unknown'}</strong>
              <span> - {formatTime(entry.bestTime)}</span>
            </li>
          ))}
        </ol>
      )}
      <Link href="/">戻る</Link>
    </div>
  );
}