import Header from "@/components/Header";
import { Suspense } from 'react'; // ★ Suspenseをreactからインポート

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ★ HeaderコンポーネントをSuspenseで囲む */}
      <Suspense fallback={<header style={{ height: '57px' }} />}>
        <Header />
      </Suspense>
      
      <main>{children}</main>
    </>
  );
}