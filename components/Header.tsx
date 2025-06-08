"use client";

import Link from 'next/link';
import { useUser } from '@stackframe/stack';
import SignOutButton from './ui/SignOutButton';

export default function Header() {
  const user = useUser();
  console.log("--- The 'user' object from useUser() is:",user);

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc', alignItems: 'center' }}>
      <Link href="/">
        Bit Breaker
      </Link>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link href="/ranking/time-attack">タイムアタックランキング</Link>
            <Link href="/settings">{user.displayName || 'unknown'}のアカウント設定</Link>
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