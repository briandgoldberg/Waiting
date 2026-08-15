import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://waitingforpower.com"),
  title: "WaitingForPower — Energy Project Tracker",
  description:
    "Tracking proposed U.S. energy projects — generation, transmission, storage, LNG, and pipelines, every fuel type — and how long each has been waiting for approval, and why.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen flex flex-col`}>
        <header className="border-b border-[var(--border)] bg-[var(--panel)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">WaitingForPower</span>
              <span className="text-xs text-[var(--muted)] hidden sm:inline">
                an Energy Project Tracker
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
                Map &amp; list
              </Link>
              <Link
                href="/policies"
                className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              >
                Policies
              </Link>
              <Link href="/methodology" className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
                Methodology
              </Link>
              <Link href="/contact" className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
                Contact us
              </Link>
            </nav>
          </div>
        </header>
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-1.5 text-xs text-center">
            🚧 This site is under active construction — more projects and data sources are being
            added regularly.{" "}
            <Link href="/methodology" className="underline font-medium">
              See what&rsquo;s live so far
            </Link>
            .
          </div>
        </div>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-[var(--border)] bg-[var(--panel)] text-xs text-[var(--muted)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
            <p>
              WaitingForPower tracks U.S. energy projects of every fuel type — bipartisan,
              structural, sourced.{" "}
              <Link href="/methodology" className="underline">Methodology &amp; sources</Link>.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/contact" className="underline">
                Contact us
              </Link>
              <a
                href="https://github.com/briandgoldberg/WaitingForPower"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Source on GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
