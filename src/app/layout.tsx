import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Vibe Validator",
  description: "Sanity check your messy shower thoughts with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen relative Cyber-Academic-bg`}>
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBWMEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none z-0" />
        
        <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-6 md:p-12 lg:px-24">
          <header className="w-full max-w-4xl flex items-center justify-between mb-16">
            <h1 className="text-2xl font-mono font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-cyber-accent-cyan text-glow-cyan">&lt;</span>
              VibeValidator
              <span className="text-cyber-accent-purple text-glow-purple">/&gt;</span>
            </h1>
            <div className="text-sm font-mono text-gray-400">v0.1.0-alpha</div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
