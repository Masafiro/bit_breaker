// pages/ranking/index.tsx や app/ranking/page.tsx など、このページのファイルに貼り付けてください

import Link from 'next/link';
import { BrainCircuit, Zap } from 'lucide-react'; // アイコンをインポート

// カードコンポーネント
const RankingCard = ({ href, icon, title, description }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  // :hover スタイルを<style>タグとして埋め込む
  const hoverStyle = `
    .ranking-card:hover {
      border-color: #888;
      transform: translateY(-2px);
    }
  `;

  return (
    <>
      <style>{hoverStyle}</style>
      <Link href={href} passHref style={{ textDecoration: 'none' }}>
        <div 
          className="ranking-card"
          style={{
            background: '#1C1C1C', // 少し明るいダークグレー
            border: '1px solid #333', // 他のページと合わせた境界線
            borderRadius: '8px',
            padding: '1.5rem',
            color: '#E0E0E0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            transition: 'border-color 0.2s ease-in-out, transform 0.2s ease-in-out',
          }}
        >
          <div style={{ color: '#999' }}>{icon}</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
            {title}
          </h3>
          <p style={{ margin: 0, color: '#AAA', flexGrow: 1, fontSize: '0.9rem' }}>
            {description}
          </p>
        </div>
      </Link>
    </>
  );
};

// メインのページコンポーネント
export default function RankingSelectionPage() {
  return (
    <div style={{ 
      background: '#111', // 他のページと合わせた黒背景
      color: '#E0E0E0',
      minHeight: 'calc(100vh - 60px)', // ヘッダー等の高さを考慮
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '800px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#FFFFFF',
          margin: '0 0 0.75rem 0',
          borderBottom: '1px solid #333',
          paddingBottom: '1rem',
        }}>
          ランキング
        </h1>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '800px',
      }}>
        <RankingCard
          href="/ranking/problem"
          icon={<BrainCircuit size={28} />}
          title="熟考ランキング"
          description="クリアした問題の総数と質で競います"
        />
        <RankingCard
          href="/ranking/time-attack"
          icon={<Zap size={28} />}
          title="タイムアタックランキング"
          description="各ステージの合計クリアタイムの速さで競います"
        />
        {/* 新しいランキングを追加する場合は、ここにRankingCardを追記します */}
      </div>
    </div>
  );
}