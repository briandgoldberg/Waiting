import type { Metadata } from "next";
import { AboutPanel } from "@/components/about/AboutPanel";

export const metadata: Metadata = {
  title: "Contact — WaitingForPower",
  description: "Get in touch with WaitingForPower — bugs, feedback, data, partnerships, and press.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6">
      <AboutPanel />
    </div>
  );
}
