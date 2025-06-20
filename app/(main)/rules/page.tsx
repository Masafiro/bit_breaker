import Link from 'next/link';
import { TIME_RATE, UNDO_PENALTY, RETRY_PENALTY, MOVE_PENALTY_RATE } from '@/lib/constants';

export default function RulesPage() {
  // テーブルを見やすくするための共通スタイル

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', position: 'relative', fontSize: '2.5rem', marginBottom: '2rem' }}>
        <h1><strong> BIT BREAKER のルール </strong></h1>
      </div>

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
            <table className="custom-table">
              <thead><tr><th>A</th><th>B</th><th>A AND B</th></tr></thead>
              <tbody>
                <tr><td>0</td><td>0</td><td>0</td></tr>
                <tr><td>0</td><td>1</td><td>0</td></tr>
                <tr><td>1</td><td>0</td><td>0</td></tr>
                <tr><td>1</td><td>1</td><td>1</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>OR (論理和)</strong>
            <table className="custom-table">
             <thead><tr><th>A</th><th>B</th><th>A OR B</th></tr></thead>
             <tbody>
                <tr><td>0</td><td>0</td><td>0</td></tr>
                <tr><td>0</td><td>1</td><td>1</td></tr>
                <tr><td>1</td><td>0</td><td>1</td></tr>
                <tr><td>1</td><td>1</td><td>1</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>XOR (排他的論理和)</strong>
            <table className="custom-table">
              <thead><tr><th>A</th><th>B</th><th>A XOR B</th></tr></thead>
              <tbody>
                <tr><td>0</td><td>0</td><td>0</td></tr>
                <tr><td>0</td><td>1</td><td>1</td></tr>
                <tr><td>1</td><td>0</td><td>1</td></tr>
                <tr><td>1</td><td>1</td><td>0</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>NOT (否定)</strong>
            <table className="custom-table">
              <thead><tr><th>A</th><th>NOT A</th></tr></thead>
              <tbody>
                <tr><td>0</td><td>1</td></tr>
                <tr><td>1</td><td>0</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className='code-box'>
          <strong>【具体例】 「現在」が <code className="code-block">10101</code> の場合:</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', fontFamily: 'monospace', fontSize: '1.1rem', lineHeight: '2' }}>
            <li>
              <code className="code-block">10101</code> AND <code className="code-block">00111</code> → <code className="code-block">00101</code> (両方が1の桁だけが1になる)
            </li>
            <li>
              <code className="code-block">10101</code> OR <code className="code-block">00111</code> → <code className="code-block">10111</code> (どちらかが1の桁は1になる)
            </li>
            <li>
              <code className="code-block">10101</code> XOR <code className="code-block">00111</code> → <code className="code-block">10010</code> (桁の値が違うところだけが1になる)
            </li>
            <li>
              NOT <code className="code-block">10101</code> → <code className="code-block">01010</code> (0と1がすべて反転する)
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

        <div className='code-box'>
          <strong>【具体例】 「現在」が <code className="code-block">10110</code> の場合:</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', fontFamily: 'monospace', fontSize: '1.1rem', lineHeight: '2' }}>
            <li>
              L-SHIFT <code className="code-block">10110</code> → <code className="code-block">01101</code> (左に循環シフト)
            </li>
            <li>
              R-SHIFT <code className="code-block">10110</code> → <code className="code-block">01011</code> (右に循環シフト)
            </li>
          </ul>
        </div>


      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          熟考モード
        </h2>
        <p style={{ marginTop: '1rem', lineHeight: '1.8' }}>
          時間制限なしで、じっくりとパズルに取り組むモードです。全50問のクリアを目指しましょう。
          各問題には「最小手数」が設定されており、その手数でクリアすると、問題選択画面のボタンが特別な色に変わります。
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
          タイムアタックモード
        </h2>
        <p style={{ marginTop: '1rem', lineHeight: '1.8' }}>
          決められた問題数を、どれだけ速くクリアできるかを競うモードです。Easy, Normal, Hard, Extra などのカテゴリがあり、モードごとにオンラインランキングが記録されます。
          一手戻ったり、リトライしたりするとペナルティタイムが加算されます。最速記録を目指しましょう！
        </p>

        <div className='code-box'>
          <strong>【ペナルティ】</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', lineHeight: '1.8' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>一手戻る:</strong> +{(UNDO_PENALTY * TIME_RATE / 1000).toFixed(2)}秒
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>リトライ:</strong> +{(RETRY_PENALTY * TIME_RATE / 1000).toFixed(2)}秒
            </li>
            <li>
              <strong>最小手数オーバー:</strong> 1手につき +{(MOVE_PENALTY_RATE * TIME_RATE / 1000).toFixed(2)}秒
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}