import { Analytics } from "@vercel/analytics/next"
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "BIT BREAKER",
  description: "ビット演算を駆使する頭脳派パズルゲーム！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <Analytics />
            <SpeedInsights />
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
