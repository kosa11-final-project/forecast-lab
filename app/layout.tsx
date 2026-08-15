import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stockit-demand-forecast-lab.dnwls0723.chatgpt.site"),
  title: "Stockit 수요예측 실험 보고서",
  description: "SKU·판매지점별 향후 90일 판매량 예측 모델의 개발 및 검증 결과",
  openGraph: {
    title: "Stockit 수요예측 실험 보고서",
    description: "SKU·판매지점별 향후 90일 판매량 예측 모델의 개발 및 검증 결과",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stockit 수요예측 실험 보고서" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockit 수요예측 실험 보고서",
    description: "SKU·판매지점별 향후 90일 판매량 예측 모델의 개발 및 검증 결과",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
