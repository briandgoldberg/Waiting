"use client";

import { useState } from "react";

// Twitter/X and Facebook both publish a real "share this URL" web intent.
// Instagram and TikTok don't — neither platform has an official web link
// for sharing an arbitrary external URL (both are app-first; the closest
// either gets is deep links for sharing content already inside their own
// app). So those two fall back to copy-to-clipboard, same pattern most
// sites use, with a brief confirmation so it's clear the click did
// something.

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
  const [copied, setCopied] = useState<"instagram" | "tiktok" | null>(null);
  const urls = shareUrls(url, text);

  async function copyLink(which: "instagram" | "tiktok") {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard access can fail (permissions, non-secure context) — the
      // buttons are non-essential, so just skip the confirmation rather
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
      <IconButton label="Copy link to share on Instagram" onClick={() => copyLink("instagram")}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.4.5.6.2 1 .5 1.5 1 .4.4.7.8 1 1.5.2.4.4 1.2.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.4-.2.6-.5 1-1 1.5-.4.4-.8.7-1.5 1-.4.2-1.2.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.4-.5-.6-.2-1-.5-1.5-1-.4-.4-.7-.8-1-1.5-.2-.4-.4-1.2-.5-2.4-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-2 .5-2.4.2-.6.5-1 1-1.5.4-.4.8-.7 1.5-1 .4-.2 1.2-.4 2.4-.5 1.3-.1 1.7-.1 4.9-.1ZM12 0C8.7 0 8.3 0 7 .1c-1.3.1-2.2.3-3 .6-.8.3-1.5.7-2.2 1.4C1.1 2.8.7 3.5.4 4.3c-.3.8-.5 1.7-.6 3C-.2 8.6-.2 9-.2 12.3s0 3.7.1 5c.1 1.3.3 2.2.6 3 .3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 3 .6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.2-.3 3-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.6-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.2-.6-3-.3-.8-.7-1.5-1.4-2.2C21.2 1.1 20.5.7 19.7.4c-.8-.3-1.7-.5-3-.6C15.4 0 15 0 11.7 0Zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.9-10.5a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0Z" />
        </svg>
      </IconButton>
      <IconButton label="Copy link to share on TikTok" onClick={() => copyLink("tiktok")}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d="M16.6 2h-3.3v13.6a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.6a6 6 0 1 0 5.2 5.9V8.3a8.3 8.3 0 0 0 5 1.7V6.7a5 5 0 0 1-5-4.7Z" />
        </svg>
      </IconButton>
      {copied && (
        <span className="text-xs text-[var(--muted)]">
          Link copied — paste it into your {copied === "instagram" ? "Instagram" : "TikTok"} post
        </span>
      )}
    </div>
  );
}
