"use client";

import { useUser } from "@stackframe/stack";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const user = useUser();
  
  // フォームの入力値を管理するためのstate
  const [displayName, setDisplayName] = useState('');
  // 処理結果のメッセージを管理するためのstate
  const [message, setMessage] = useState('');

  // ページ読み込み時に、現在のユーザー名をフォームの初期値として設定
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  // フォームが送信されたときの処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページの再読み込みを防ぐ
    if (!user) return; // ユーザーがいなければ何もしない

    setMessage('更新中...');
    try {
    // ★ 呼び出すAPIを、新しいシンプルなものに変更
    const response = await fetch('/api/user/update-name', {
      method: 'PUT', // PUTリクエスト
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: displayName }), // 新しい名前を送信
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('名前を更新しました！');
      // ここでStack-Auth側のユーザー情報も更新する（これはStack-Authの機能）
      await user.update({ displayName: displayName });
    } else {
      setMessage(`エラー: ${data.message}`);
    }
  } catch (err) {
    setMessage(`エラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
  }
};


  if (!user) {
    return <div>ログインしてください。</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>アカウント設定</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="displayName">表示名（ランキングで使われます）</label>
          <br />
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ marginTop: '0.5rem', minWidth: '300px' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          名前を変更する
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}