import Link from 'next/link';

export default function RulesPage() {
  // テーブルを見やすくするための共通スタイル
  const tableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    margin: '1rem 0',
    width: 'auto',
    fontSize: '0.9rem',
  };
  const thStyle: React.CSSProperties = {
    border: '1px solid #555',
    padding: '0.5rem',
    textAlign: 'center',
    backgroundColor: '#333',
  };
  const tdStyle: React.CSSProperties = {
    border: '1px solid #555',
    padding: '0.5rem',
    textAlign: 'center',
  };
  const codeStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    backgroundColor: '#333',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontSize: '1.1rem',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title-fancy" style={{ marginBottom: '2rem' }}>
        BIT BREAKER のルール
      </h1>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          基本操作
        </h2>
        <p style={{ marginTop: '1rem', lineHeight: '1.8' }}>
          画面上部に表示される「ターゲット」のビット列と、中央に表示される「現在」のビット列が一致すればクリアです。
          画面下部にある操作ボタンを駆使して、「現在」のビット列を「ターゲット」に変化させてください。
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          主要な操作の解説
        </h2>
        
        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '1.5rem' }}>論理演算 (AND, OR, XOR, NOT)</h3>
        <p style={{ marginTop: '0.5rem', lineHeight: '1.8' }}>
          「現在」のビット列と、ボタンに表示されているビット列の、各桁を比較して新しいビット列を生成します。
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <strong>AND (論理積)</strong>
            <table style={tableStyle}>
              <thead><tr><th style={thStyle}>A</th><th style={thStyle}>B</th><th style={thStyle}>A AND B</th></tr></thead>
              <tbody>
                <tr><td style={tdStyle}>0</td><td style={tdStyle}>0</td><td style={tdStyle}>0</td></tr>
                <tr><td style={tdStyle}>0</td><td style={tdStyle}>1</td><td style={tdStyle}>0</td></tr>
                <tr><td style={tdStyle}>1</td><td style={tdStyle}>0</td><td style={tdStyle}>0</td></tr>
                <tr><td style={tdStyle}>1</td><td style={tdStyle}>1</td><td style={tdStyle}>1</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>OR (論理和)</strong>
            <table style={tableStyle}>
             <thead><tr><th style={thStyle}>A</th><th style={thStyle}>B</th><th style={thStyle}>A OR B</th></tr></thead>
             <tbody>
                <tr><td style={tdStyle}>0</td><td style={tdStyle}>0</td><td style={tdStyle}>0</td></tr>
                <tr><td style={tdStyle}>0</td><td style={tdStyle}>1</td><td style={tdStyle}>1</td></tr>
                <tr><td style={tdStyle}>1</td><td style={tdStyle}>0</td><td style={tdStyle}>1</td></tr>
                <tr><td style={tdStyle}>1</td><td style={tdStyle}>1</td><td style={tdStyle}>1</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>XOR (排他的論理和)</strong>
            <table style={tableStyle}>
              <thead><tr><th style={thStyle}>A</th><th style={thStyle}>B</th><th style={thStyle}>A XOR B</th></tr></thead>
              <tbody>
                <tr><td style={tdStyle}>0</td><td style={tdStyle}>0</td><td style={tdStyle}>0</td></tr>
                <tr><td style={tdStyle}>0</td><td style={tdStyle}>1</td><td style={tdStyle}>1</td></tr>
                <tr><td style={tdStyle}>1</td><td style={tdStyle}>0</td><td style={tdStyle}>1</td></tr>
                <tr><td style={tdStyle}>1</td><td style={tdStyle}>1</td><td style={tdStyle}>0</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>NOT (否定)</strong>
            <table style={tableStyle}>
              <thead><tr><th style={thStyle}>A</th><th style={thStyle}>NOT A</th></tr></thead>
              <tbody>
                <tr><td style={tdStyle}>0</td><td style={tdStyle}>1</td></tr>
                <tr><td style={tdStyle}>1</td><td style={tdStyle}>0</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px' }}>
          <strong>【具体例】 「現在」が <code style={codeStyle}>10101</code> の場合:</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', fontFamily: 'monospace', fontSize: '1.1rem', lineHeight: '2' }}>
            <li>
              <code style={codeStyle}>10101</code> AND <code style={codeStyle}>00111</code> → <code style={codeStyle}>00101</code> (両方が1の桁だけが1になる)
            </li>
            <li>
              <code style={codeStyle}>10101</code> OR <code style={codeStyle}>00111</code> → <code style={codeStyle}>10111</code> (どちらかが1の桁は1になる)
            </li>
            <li>
              <code style={codeStyle}>10101</code> XOR <code style={codeStyle}>00111</code> → <code style={codeStyle}>10010</code> (桁の値が違うところだけが1になる)
            </li>
            <li>
              NOT <code style={codeStyle}>10101</code> → <code style={codeStyle}>01010</code> (0と1がすべて反転する)
            </li>
          </ul>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '2rem' }}>シフト演算 (L-SHIFT, R-SHIFT)</h3>
        <p style={{ marginTop: '0.5rem', lineHeight: '1.8' }}>
          「現在」のビット列全体を、左右に一つずつずらします。端からはみ出たビットは、反対側の端に移動します（循環シフト）。
        </p>
        <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
          <li><strong>L-SHIFT (左シフト)</strong>: 全てのビットが左に一つずれ、一番左のビットが一番右に移動します。</li>
          <li style={{ marginTop: '0.5rem' }}><strong>R-SHIFT (右シフト)</strong>: 全てのビットが右に一つずれ、一番右のビットが一番左に移動します。</li>
        </ul>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px' }}>
          <strong>【具体例】 「現在」が <code style={codeStyle}>10110</code> の場合:</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', fontFamily: 'monospace', fontSize: '1.1rem', lineHeight: '2' }}>
            <li>
              L-SHIFT <code style={codeStyle}>10110</code> → <code style={codeStyle}>01101</code> (左に循環シフト)
            </li>
            <li>
              R-SHIFT <code style={codeStyle}>10110</code> → <code style={codeStyle}>01011</code> (右に循環シフト)
            </li>
          </ul>
        </div>


      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          熟考モード (Problem Mode)
        </h2>
        <p style={{ marginTop: '1rem', lineHeight: '1.8' }}>
          時間制限なしで、じっくりとパズルに取り組むモードです。全50問のクリアを目指しましょう。
          各問題には「最小手数」が設定されており、その手数でクリアすると、問題選択画面のボタンが特別な色に変わります。
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          タイムアタックモード (Time Attack Mode)
        </h2>
        <p style={{ marginTop: '1rem', lineHeight: '1.8' }}>
          決められた問題数を、どれだけ速くクリアできるかを競うモードです。Easy, Normal, Hard, Extra などのカテゴリがあり、モードごとにオンラインランキングが記録されます。
          一手戻ったり、リトライしたりするとペナルティタイムが加算されます。最速記録を目指しましょう！
        </p>
      </section>
    </div>
  );
}