import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Food Kitchen — здоровое питание с доставкой",
  description: "Готовые рационы ФИТ, ХИТ и ПРО с доставкой. Калькулятор питания и оформление заявки.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} antialiased bg-stone-50 text-stone-900`}>{children}</body>
    </html>
  );
}
