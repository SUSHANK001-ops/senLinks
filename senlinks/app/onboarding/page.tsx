"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

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

  const [username, setUsername] = useState("");
  const [checkStatus, setCheckStatus] = useState<Status>("idle");
  const [checkMsg, setCheckMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-fill from user's display name
  useEffect(() => {
    if (session?.user?.name) {
      const suggested = usernameFromName(session.user.name);
      setUsername(suggested);
    }
  }, [session?.user?.name]);

  // Redirect if already has a real username (not a cuid)
  useEffect(() => {
    const u = (session?.user as { username?: string })?.username;
    // cuid starts with 'c' and is 25 chars — if it looks human, skip onboarding
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      return;
    }
    // Refresh session so username propagates
    await update();
    router.replace("/admin");
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.replace("/login");
    return null;
  }

  const statusIcon = {
    idle: null,
    checking: (
      <FiLoader className="animate-spin text-white/40" size={16} />
    ),
    available: <FiCheck className="text-emerald-400" size={16} />,
    taken: <FiX className="text-red-400" size={16} />,
    invalid: <FiX className="text-red-400" size={16} />,
  }[checkStatus];

  const borderColor = {
    idle: "border-white/10",
    checking: "border-white/20",
    available: "border-emerald-500/60",
    taken: "border-red-500/60",
    invalid: "border-red-500/60",
  }[checkStatus];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          {session.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="avatar"
              className="w-16 h-16 rounded-full ring-4 ring-violet-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-violet-500/30">
              {session.user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        {/* Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-20 blur-lg -z-10" />

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              Choose your username
            </h1>
            <p className="text-sm text-white/50">
              Hey{session.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}! This is your public profile URL.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL preview */}
            <div className="bg-white/5 rounded-lg px-4 py-2.5 text-sm text-white/50 font-mono border border-white/10 truncate">
              senlinks.app/
              <span className={username ? "text-violet-300" : "text-white/20"}>
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
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                maxLength={20}
                placeholder="e.g. johndoe"
                className={`w-full px-4 py-3 pr-10 bg-white/5 border ${borderColor} rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`}
              />
              {statusIcon && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {statusIcon}
                </span>
              )}
            </div>

            {/* Status message */}
            {checkMsg && (
              <p
                className={`text-xs ${
                  checkStatus === "available"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {checkMsg}
              </p>
            )}
            <p className="text-xs text-white/30">
              3–20 characters · lowercase letters, numbers, underscores only
            </p>

            {saveError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}

            <button
              id="save-username"
              type="submit"
              disabled={checkStatus !== "available" || saving}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                "Continue →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
