import Link from 'next/link';

export default function RulesPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', position: 'relative', fontSize: '2.0rem' }}>
        <h1><strong>BIT BREAKER のルール</strong></h1>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          基本操作
        </h2>
        <p style={{ marginTop: '1rem' }}>
          画面上部に表示される「ターゲット」のビット列と、中央に表示される「現在」のビット列が一致すればクリアです。
          画面下部にある操作ボタンを駆使して、「現在」のビット列を「ターゲット」に変化させてください。
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          熟考モード (Problem Mode)
        </h2>
        <p style={{ marginTop: '1rem' }}>
          時間制限なしで、じっくりとパズルに取り組むモードです。全50問のクリアを目指しましょう。
          各問題には「最小手数」が設定されており、その手数でクリアすると、問題選択画面のボタンが特別な色に変わります。
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          タイムアタックモード (Time Attack Mode)
        </h2>
        <p style={{ marginTop: '1rem' }}>
          決められた問題数を、どれだけ速くクリアできるかを競うモードです。Easy, Normal, Hard, Extra などのカテゴリがあり、モードごとにオンラインランキングが記録されます。
          一手戻ったり、リトライしたり、最小手数より多い手数でクリアしたりするとペナルティタイムが加算されます。最速記録を目指しましょう！
        </p>
      </section>
    </div>
  );
}