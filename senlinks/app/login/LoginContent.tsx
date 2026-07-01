"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function LoginContent() {
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  async function handleOAuth(provider: "google" | "github") {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl: "/onboarding" });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-[#1E3A8A] w-full" />

      {/* Nav */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image src="/logo.gif" alt="SenLinks Logo" width={28} height={28} unoptimized />
            <span className="font-display text-lg font-bold text-[#1E3A8A] tracking-tight">SenLinks</span>
          </Link>
          <span className="text-xs text-[#6B7280]">
            It&apos;s free —{" "}
            <Link
              href="/"
              className="text-[#1E3A8A] font-semibold hover:underline"
            >
              Learn more
            </Link>
          </span>
        </div>
      </header>

      {/* Center */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB]">
              <Image src="/logo.gif" alt="SenLinks Logo" width={48} height={48} unoptimized />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-[#111827] mb-2">
              Sign in to SenLinks
            </h1>
            <p className="text-sm text-[#6B7280]">
              Your link-in-bio, beautifully managed.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-7 shadow-sm">
            <div className="space-y-3">
              {/* Google */}
              <button
                id="google-signin"
                type="button"
                disabled={loadingProvider !== null}
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] text-[#111827] text-sm font-semibold rounded-xl hover:bg-[#F9FAFB] hover:border-[#D1D5DB] active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
              >
                {loadingProvider === "google" ? (
                  <span className="h-4 w-4 border-2 border-[#D1D5DB] border-t-[#1E3A8A] rounded-full animate-spin" />
                ) : (
                  <FaGoogle size={16} className="text-[#EA4335]" />
                )}
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                id="github-signin"
                type="button"
                disabled={loadingProvider !== null}
                onClick={() => handleOAuth("github")}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] text-white text-sm font-semibold rounded-xl hover:bg-[#2f363d] active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
              >
                {loadingProvider === "github" ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaGithub size={16} />
                )}
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[11px] text-[#9CA3AF] font-medium tracking-wide uppercase">
                or
              </span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <p className="text-center text-xs text-[#6B7280] leading-relaxed">
              Email &amp; password login coming soon.
              <br />
              Use Google or GitHub to get started.
            </p>
          </div>

          {/* Legal */}
          <p className="text-center text-[11px] text-[#9CA3AF] mt-6 leading-relaxed">
            By continuing you agree to our{" "}
            <span className="text-[#1E3A8A] cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-[#1E3A8A] cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-5">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display text-sm font-bold text-[#1E3A8A]">
            SenLinks
          </span>
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} SenLinks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
