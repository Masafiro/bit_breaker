"use client";

import Link from 'next/link';
import { useUser } from '@stackframe/stack';
import SignOutButton from './ui/SignOutButton';

export default function Header() {
  const user = useUser();
  console.log("--- The 'user' object from useUser() is:",user);

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc', alignItems: 'center' }}>
        表示して〜ー
      <Link href="/">
        Bit Breaker
      </Link>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span>ようこそ, {user.displayName || 'ユーザー'}さん</span>
            <Link href="/settings">アカウント設定</Link>
            <Link href="/ranking/time-attack">ランキング</Link>
            <SignOutButton />
          </>
        ) : (
          <>
            <span>ログインしていません</span>
            <Link href="/handler/sign-in">Sign In</Link>
            <Link href="/handler/sign-up">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}