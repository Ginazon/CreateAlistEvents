import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers"; // <-- YENİ IMPORT

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
    <html lang="en">
      <body className="antialiased">
        {/* Tüm uygulamayı Providers ile sarıyoruz */}
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}