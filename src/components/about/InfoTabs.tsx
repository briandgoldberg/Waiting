"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AboutPanel } from "./AboutPanel";
import { MethodologyPanel } from "./MethodologyPanel";

type TabId = "about" | "methodology";

const TABS: { id: TabId; label: string; href: string }[] = [
  { id: "about", label: "About Us", href: "/about" },
  { id: "methodology", label: "Methodology", href: "/methodology" },
];

export function InfoTabs({ initialTab }: { initialTab: TabId }) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const router = useRouter();

  function selectTab(next: TabId) {
    setTab(next);
    router.replace(TABS.find((t) => t.id === next)!.href, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6">
      <div
        role="tablist"
        aria-label="About and methodology"
        className="flex gap-1 border-b border-[var(--border)] mb-6"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => selectTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "about" && <AboutPanel />}
      {tab === "methodology" && <MethodologyPanel />}
    </div>
  );
}
