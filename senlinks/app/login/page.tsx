import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In — SenLinks",
  description: "Sign in to your SenLinks account.",
};

// Server component gate — redirects already-authenticated users
export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.usernameSet) {
      redirect("/admin");
    } else {
      redirect("/onboarding");
    }
  }

  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
