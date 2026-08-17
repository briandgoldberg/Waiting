import type { Metadata } from "next";
import { InfoTabs } from "@/components/about/InfoTabs";

export const metadata: Metadata = {
  title: "Contact — WaitingForPower",
  description: "Get in touch with WaitingForPower — bugs, feedback, data, partnerships, and press.",
};

export default function ContactPage() {
  return <InfoTabs initialTab="about" />;
}
