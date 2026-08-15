"use client";

import { useState } from "react";

// Twitter/X and Facebook both publish a real "share this URL" web intent.
// Neither Instagram nor TikTok does — both are app-first with no official
// web link for sharing an arbitrary external URL — so there's a single
// generic "Share" button instead: it opens the OS share sheet (lists
// whatever apps are actually installed, including Instagram/TikTok) where
// supported, and falls back to copying the link to the clipboard where it
// isn't (most desktop browsers).
//
// Facebook's sharer.php ignores any text passed via URL params (its old
// `quote` param is unreliable and mostly deprecated) — it scrapes the
// target URL's Open Graph tags (og:title/og:description) for what to show,
// unlike Twitter's intent link, which does take a `text` param directly.
// So getting "good" Facebook share text is a metadata problem, not
// something this component can control — see generateMetadata in
// src/app/project/[id]/page.tsx and the openGraph block in src/app/layout.tsx.

function shareUrls(url: string, text: string) {
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };
}

function IconButton({
  label,
  onClick,
  href,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={className}>
      {children}
    </button>
  );
}

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const urls = shareUrls(url, text);

  async function share() {
    // Prefer the OS-level share sheet where available (most mobile
    // browsers, some desktop ones) — it lists whatever apps are actually
    // installed, including Instagram/TikTok, which is strictly better than
    // a clipboard copy. Falls back to copying the link when unsupported.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {
        // User cancelled the share sheet, or it failed — fall through to
        // clipboard copy rather than leaving the click looking like a no-op.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail too (permissions, non-secure context) —
      // the button is non-essential, so just skip the confirmation rather
      // than surface an error for a share action.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <IconButton label="Share on X (Twitter)" href={urls.twitter}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.5-7.2L4.3 22H1.2l8.1-9.3L1 2h7.3l5 6.6L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
        </svg>
      </IconButton>
      <IconButton label="Share on Facebook" href={urls.facebook}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
        </svg>
      </IconButton>
      <IconButton label="Share" onClick={share}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.2 10.8 15.8 6.7M8.2 13.2l7.6 4.1" strokeLinecap="round" />
        </svg>
      </IconButton>
      {copied && <span className="text-xs text-[var(--muted)]">Link copied</span>}
    </div>
  );
}
