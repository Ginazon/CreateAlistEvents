import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./i18n"; // <-- Yanındaki dosyadan çekiyor

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
      <body className="antialiased bg-gray-50 text-gray-900">
        <I18nProvider>
            {children}
        </I18nProvider>
      </body>
    </html>
  );
}