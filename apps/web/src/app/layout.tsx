import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "a402 Playground & Inspector",
  description: "Simulate, inspect, and debug a402 + Beep payment flows on Sui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen overflow-hidden bg-[#0b0c10] text-foreground">
            <div className="pointer-events-none absolute inset-0 -z-20 ambient opacity-50" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(255,0,237,0.08),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(4,217,255,0.08),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(115,255,109,0.05),transparent_26%)]" />

            <Providers>{children}</Providers>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
