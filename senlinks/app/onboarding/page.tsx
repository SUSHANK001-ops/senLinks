"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiLoader, FiArrowLeft } from "react-icons/fi";
import Image from "next/image";

type Status = "idle" | "checking" | "available" | "taken" | "invalid";
type Step = "pick" | "confirm";

function usernameFromName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>("pick");
  const [username, setUsername] = useState("");
  const [checkStatus, setCheckStatus] = useState<Status>("idle");
  const [checkMsg, setCheckMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const host =
    typeof window !== "undefined" ? window.location.host : "senlinks.app";

  // Pre-fill from user's display name
  useEffect(() => {
    if (session?.user?.name) {
      const suggested = usernameFromName(session.user.name);
      setUsername(suggested);
    }
  }, [session?.user?.name]);

  // Redirect if already has a real username
  useEffect(() => {
    const u = (session?.user as { username?: string })?.username;
    if (u && !(u.startsWith("c") && u.length >= 20)) {
      router.replace("/admin");
    }
  }, [session, router]);

  // Debounced availability check
  useEffect(() => {
    if (!username) {
      setCheckStatus("idle");
      setCheckMsg("");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setCheckStatus("checking");
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/auth/username?q=${encodeURIComponent(username)}`
      );
      const data = await res.json();
      if (data.error) {
        setCheckStatus("invalid");
        setCheckMsg(data.error);
      } else if (data.available) {
        setCheckStatus("available");
        setCheckMsg("Username is available!");
      } else {
        setCheckStatus("taken");
        setCheckMsg("Username is already taken.");
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  async function handleConfirm() {
    if (checkStatus !== "available") return;
    setSaving(true);
    setSaveError("");
    const res = await fetch("/api/auth/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSaveError(data.error ?? "Something went wrong");
      setSaving(false);
      setStep("pick");
      return;
    }
    await update();
    router.replace("/admin");
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#E5E7EB] border-t-[#1E3A8A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.replace("/login");
    return null;
  }

  const statusIcon = {
    idle: null,
    checking: <FiLoader className="animate-spin text-[#9CA3AF]" size={16} />,
    available: <FiCheck className="text-[#1FAE7A]" size={16} />,
    taken: <FiX className="text-[#B91C1C]" size={16} />,
    invalid: <FiX className="text-[#B91C1C]" size={16} />,
  }[checkStatus];

  const borderColor = {
    idle: "border-[#E5E7EB]",
    checking: "border-[#D1D5DB]",
    available: "border-[#1FAE7A]",
    taken: "border-[#B91C1C]",
    invalid: "border-[#B91C1C]",
  }[checkStatus];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top accent */}
      <div className="h-1 bg-[#1E3A8A] w-full" />

      {/* Nav */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <span className="font-display text-lg font-bold text-[#1E3A8A]">
            SenLinks
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full ring-4 ring-[#1E3A8A]/20 border-2 border-white shadow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-2xl font-bold shadow ring-4 ring-[#1E3A8A]/20">
                {session.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          {/* Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
            {/* ── STEP 1: Pick username ── */}
            {step === "pick" && (
              <>
                <div className="text-center mb-7">
                  <h1 className="font-display text-2xl font-bold text-[#111827] mb-1">
                    Choose your username
                  </h1>
                  <p className="text-sm text-[#6B7280]">
                    Hey
                    {session.user?.name
                      ? `, ${session.user.name.split(" ")[0]}`
                      : ""}
                    ! This becomes your public profile URL.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* URL preview */}
                  <div className="bg-[#F9FAFB] rounded-lg px-4 py-2.5 text-sm text-[#6B7280] font-mono border border-[#E5E7EB] truncate">
                    {host}/
                    <span
                      className={
                        username ? "text-[#1E3A8A] font-semibold" : "text-[#D1D5DB]"
                      }
                    >
                      {username || "yourname"}
                    </span>
                  </div>

                  {/* Input */}
                  <div className="relative">
                    <input
                      id="username-input"
                      type="text"
                      autoFocus
                      autoComplete="off"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                        )
                      }
                      maxLength={20}
                      placeholder="e.g. johndoe"
                      className={`w-full px-4 py-3 pr-10 bg-white border-2 ${borderColor} rounded-xl text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none transition-all`}
                    />
                    {statusIcon && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {statusIcon}
                      </span>
                    )}
                  </div>

                  {checkMsg && (
                    <p
                      className={`text-xs font-medium ${
                        checkStatus === "available"
                          ? "text-[#1FAE7A]"
                          : "text-[#B91C1C]"
                      }`}
                    >
                      {checkMsg}
                    </p>
                  )}
                  <p className="text-xs text-[#9CA3AF]">
                    3–20 chars · lowercase, numbers, underscores only
                  </p>

                  <button
                    id="check-username"
                    type="button"
                    disabled={checkStatus !== "available"}
                    onClick={() => setStep("confirm")}
                    className="w-full py-3 bg-[#1E3A8A] text-white text-sm font-semibold rounded-xl hover:bg-[#15296B] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow"
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: Confirm ── */}
            {step === "confirm" && (
              <>
                <div className="text-center mb-7">
                  <h1 className="font-display text-2xl font-bold text-[#111827] mb-1">
                    Confirm your username
                  </h1>
                  <p className="text-sm text-[#6B7280]">
                    You can change this later in settings.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* URL confirmation card */}
                  <div className="bg-[#EEF2FF] border border-[#1E3A8A]/20 rounded-xl p-5 text-center space-y-1.5">
                    <p className="text-[10px] font-semibold text-[#1E3A8A] uppercase tracking-widest">
                      Your public URL
                    </p>
                    <p className="text-base font-bold text-[#111827] font-mono break-all">
                      {host}/
                      <span className="text-[#1E3A8A]">{username}</span>
                    </p>
                  </div>

                  {saveError && (
                    <p className="text-xs text-[#B91C1C] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {saveError}
                    </p>
                  )}

                  <button
                    id="confirm-username"
                    type="button"
                    disabled={saving}
                    onClick={handleConfirm}
                    className="w-full py-3 bg-[#1E3A8A] text-white text-sm font-semibold rounded-xl hover:bg-[#15296B] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting up your profile…
                      </span>
                    ) : (
                      "✓ Confirm & Go to Dashboard"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("pick");
                      setSaveError("");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    <FiArrowLeft size={13} /> Change username
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-5">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} SenLinks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
