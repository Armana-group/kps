import type { Metadata } from "next";
import { Hanken_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { KondorWalletProvider } from "@/contexts/KondorWalletContext";
import { HeaderSlotProvider } from "@/components/header-slot";
import { Navigation } from "@/components/navigation";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "react-hot-toast";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Koinos Fund System",
  description: "The on-chain fund where KOIN holders vote on which community projects get paid each month.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${hanken.variable} ${dmMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <KondorWalletProvider>
            <HeaderSlotProvider>
              <Navigation />
              <div className="min-h-[calc(100vh-76px)] flex flex-col">
                <div className="flex-1">{children}</div>
                <SiteFooter />
              </div>
            </HeaderSlotProvider>
            <Toaster
              position="top-right"
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--paper)",
                  color: "var(--ink)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  boxShadow: "0 16px 32px -20px rgba(0,0,0,.3)",
                },
                success: {
                  duration: 3000,
                  iconTheme: { primary: "var(--ink)", secondary: "var(--paper)" },
                },
                error: {
                  duration: 5000,
                  iconTheme: { primary: "var(--danger)", secondary: "var(--paper)" },
                },
              }}
            />
          </KondorWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
