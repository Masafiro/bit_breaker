"use client";

import Link from 'next/link';
import { useUser, SignIn, SignUp } from '@stackframe/stack';
import Image from 'next/image'; 
import { Home, Trophy, UserCircle } from 'lucide-react';
import { ScrollIcon } from 'lucide-react';

export default function Header() {
  const user = useUser();
  console.log("--- The 'user' object from useUser() is:",user);

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc', alignItems: 'center' }}>
      <Link href="/">
        <Home size={32} />
      </Link>
      <Link href="/rules">
        <ScrollIcon size={32} />
      </Link>
      <Link href="/ranking">
        <Trophy size={32} />
      </Link>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <Link href="/account">
            {user.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt="アカウント設定"
                width={32} 
                height={32}
                style={{ borderRadius: '50%' }} 
              /> 
            ) : (
              <UserCircle size={32} />
)}
          </Link>
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