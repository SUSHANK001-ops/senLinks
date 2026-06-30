"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FaGithub, FaGoogle } from "react-icons/fa";

function LoginContent() {
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  async function handleOAuth(provider: "google" | "github") {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl: "/onboarding" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold text-white tracking-tight">
            Sen<span className="text-violet-400">Links</span>
          </Link>
        </div>
      </header>

      {/* Center card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Glass card */}
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-20 blur-lg -z-10" />

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-white/50">
                Sign in to continue to SenLinks
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="google-signin"
                type="button"
                disabled={loadingProvider !== null}
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 text-sm font-semibold rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md"
              >
                {loadingProvider === "google" ? (
                  <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaGoogle size={16} className="text-red-500" />
                )}
                Continue with Google
              </button>

              <button
                id="github-signin"
                type="button"
                disabled={loadingProvider !== null}
                onClick={() => handleOAuth("github")}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] text-white text-sm font-semibold rounded-xl hover:bg-[#2f363d] active:scale-[0.98] transition-all disabled:opacity-60 shadow-md border border-white/10"
              >
                {loadingProvider === "github" ? (
                  <span className="h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaGithub size={16} />
                )}
                Continue with GitHub
              </button>
            </div>

            <p className="text-center text-xs text-white/30 mt-8">
              By continuing, you agree to our{" "}
              <span className="text-violet-400 cursor-pointer hover:underline">
                Terms
              </span>{" "}
              and{" "}
              <span className="text-violet-400 cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
