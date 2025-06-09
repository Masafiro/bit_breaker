"use client";

import { Suspense } from "react";
import { AccountSettings } from "@stackframe/stack";

export default function MyAccountPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>読み込み中...</div>}>
      <AccountSettings fullPage={true} />
    </Suspense>
  );
}