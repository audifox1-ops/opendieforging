import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "태웅 15,000T 단조 시방서 시스템",
  description: "태웅 15,000T 오픈다이 단조 프레스 AI 기반 시방서 생성 및 CAPA 검증 대시보드",
  keywords: ["태웅", "단조", "시방서", "CAPA", "15000T", "오픈다이", "Taewoong"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
