import type { Metadata } from "next";
import { InfoTabs } from "@/components/about/InfoTabs";

export const metadata: Metadata = {
  title: "Methodology — WaitingForPower",
  description: "How the numbers on WaitingForPower are computed, what they assume, and where they're deliberately incomplete.",
};

export default function MethodologyPage() {
  return <InfoTabs initialTab="methodology" />;
}
