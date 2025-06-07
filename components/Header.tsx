"use client";

import Link from 'next/link';
import { useUser } from '@stackframe/stack';
import SignOutButton from './ui/SignOutButton'; // 先ほど作成したボタンをインポート

export default function Header() {
  const user = useUser();

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link href="/">
        Bit Breaker
      </Link>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span>ようこそ, {user.displayName || 'ユーザー'}さん</span>
            <Link href="/settings">アカウント設定</Link>
            <SignOutButton />
          </>
        ) : (
          <>
            <Link href="/handler/sign-in">Sign In</Link>
            <Link href="/handler/sign-up">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}