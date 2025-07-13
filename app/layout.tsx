import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { KondorWalletProvider } from "@/contexts/KondorWalletContext";
import { Navigation } from "@/components/navigation";
import { Toaster } from "react-hot-toast";

// SF Pro Display is Apple's signature font, fallback to Inter
const sfProDisplay = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Koinos Proposals",
  description: "Governance proposals for the Koinos blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sfProDisplay.variable} ${inter.variable} font-sans antialiased`}
      >
                <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <KondorWalletProvider>
            <Navigation />
            {children}
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                // Default options for all toasts
                className: '',
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
                // Default options for specific types
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: 'hsl(var(--primary))',
                    secondary: 'hsl(var(--primary-foreground))',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: 'hsl(var(--destructive))',
                    secondary: 'hsl(var(--destructive-foreground))',
                  },
                },
              }}
            />
          </KondorWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
