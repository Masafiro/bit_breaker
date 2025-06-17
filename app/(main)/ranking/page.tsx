import Link from 'next/link';
import { BrainCircuit, Zap, Trophy } from 'lucide-react'; // アイコンをインポート

// カードコンポーネントを定義（再利用可能）
const RankingCard = ({ href, icon, title, description }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, #2a2d32, #212428)',
    border: '1px solid #3a3f44',
    borderRadius: '12px',
    padding: '2rem',
    textDecoration: 'none',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    boxShadow: '5px 5px 10px #1b1d20, -5px -5px 10px #35393e',
  };

  const hoverStyle: string = `
    .ranking-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 8px 8px 16px #1b1d20, -8px -8px 16px #35393e, inset 1px 1px 2px #35393e, inset -1px -1px 2px #1b1d20;
    }
  `;

  return (
    <>
      <style>{hoverStyle}</style>
      <Link href={href} passHref className="ranking-card" style={cardStyle}>
        <div style={{ color: '#00aaff' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', margin: 0 }}>
          {title}
        </h3>
        <p style={{ margin: 0, color: '#a0a0a0', flexGrow: 1 }}>
          {description}
        </p>
        <div style={{ marginTop: '1rem', color: '#00aaff', fontWeight: '500', alignSelf: 'flex-end' }}>
          ランキングを見る →
        </div>
      </Link>
    </>
  );
};

// メインのページコンポーネント
export default function RankingSelectionPage() {
  return (
    <div style={{ 
      background: '#26292d', 
      color: '#e0e0e0',
      minHeight: '100vh', 
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <Trophy size={48} style={{ color: '#ffd700', marginBottom: '1rem' }} />
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          margin: '0 0 0.5rem 0',
          background: 'linear-gradient(90deg, #00aaff, #00ffaa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ランキングハブ
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#a0a0a0', maxWidth: '600px' }}>
          あなたの限界が、ここに刻まれる。挑戦したいモードを選んで、トップランカーを目指そう。
        </p>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: '800px',
      }}>
        <RankingCard
          href="/ranking/problem"
          icon={<BrainCircuit size={32} />}
          title="熟考ランキング"
          description="閃きとロジックが試される問題解決モード。クリアした問題数で競い合え。"
        />
        <RankingCard
          href="/ranking/time-attack"
          icon={<Zap size={32} />}
          title="タイムアタックランキング"
          description="一瞬の判断が勝敗を分けるスピード勝負。コンマ1秒を削り出せ。"
        />
      </div>
    </div>
  );
}