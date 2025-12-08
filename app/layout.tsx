import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cereget",
  description: "Etkinlik Yönetim Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}