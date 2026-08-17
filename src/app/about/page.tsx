import type { Metadata } from "next";
import { AboutPanel } from "@/components/about/AboutPanel";

export const metadata: Metadata = {
  title: "About — WaitingForPower",
  description: "Who built WaitingForPower, how the numbers are computed, and how to get in touch.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6">
      <AboutPanel />
    </div>
  );
}
