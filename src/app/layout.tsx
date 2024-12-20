import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Excel 學習平台',
  description: '學習 Excel 函數和數據分析技巧',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <Script
          id="genially-embed"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function (d) { 
                var js, id = "genially-embed-js", ref = d.getElementsByTagName("script")[0]; 
                if (d.getElementById(id)) { return; } 
                js = d.createElement("script"); 
                js.id = id; 
                js.async = true; 
                js.src = "https://view.genially.com/static/embed/embed.js"; 
                ref.parentNode.insertBefore(js, ref); 
              }(document));
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
