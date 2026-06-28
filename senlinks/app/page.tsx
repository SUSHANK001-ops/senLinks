import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "SenLinks — Your Link in Bio, Simplified",
  description:
    "Create your free SenLinks profile and share all your important links in one place. Click analytics, scheduled links, and more.",
};

export default function HomePage() {
  return <LandingPage />;
}
