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
          <Link
            href="/beep"
            className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-black/40 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-neon-cyan hover:text-neon-cyan"
          >
            Beep Story
            <span aria-hidden>↗</span>
          </Link>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
