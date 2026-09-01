import type { Metadata } from "next";
import { DynaPuff, Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import AppProviders from "@/components/providers/AppProviders";
import PageLoaderWrapper from "@/components/shared/PageLoaderWrapper";
import { Toaster } from "@/components/ui/sonner";

const vazirMatn = Vazirmatn({
  variable: "--font-vazir-matn",
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "900"],
});

const dynaPuff = DynaPuff({
  variable: "--font-dyna-puff",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "KhodroJu",
  description: "بازار خودروهای صفرکیلومتر و وبلاگ تحلیل KhodroJu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      className={`${vazirMatn.variable} ${dynaPuff.variable}  h-full antialiased vazir-matn`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <header className="w-full sticky top-0 z-100" dir="rtl">
            <Header />
          </header>
          {children}
          <footer dir="rtl">
            <Footer />
          </footer>
          <PageLoaderWrapper />
          <Toaster position="top-center" dir="rtl" />
        </AppProviders>
      </body>
    </html>
  );
}
