import type { Metadata } from "next";
import { InfoTabs } from "@/components/about/InfoTabs";

export const metadata: Metadata = {
  title: "About — WaitingForPower",
  description: "Who built WaitingForPower, how the numbers are computed, and how to get in touch.",
};

export default function AboutPage() {
  return <InfoTabs initialTab="about" />;
}
