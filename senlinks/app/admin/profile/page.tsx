"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiLoader, FiSave, FiDownload } from "react-icons/fi";
import AvatarUploader from "@/components/AvatarUploader";

type CheckStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "same";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName]                     = useState("");
  const [bio, setBio]                       = useState("");
  const [avatarUrl, setAvatarUrl]           = useState<string | null>(null);
  const [oauthAvatarUrl, setOauthAvatarUrl] = useState<string | null>(null);
  const [username, setUsername]             = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [checkMsg, setCheckMsg]       = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading]     = useState(true);

  // Load current profile
  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) return;
        setName(user.name ?? "");
        setBio(user.bio ?? "");
        setAvatarUrl(user.avatarUrl ?? null);
        setOauthAvatarUrl(user.oauthAvatarUrl ?? null);
        setUsername(user.username ?? "");
        setOriginalUsername(user.username ?? "");
      })
      .finally(() => setLoading(false));
  }, [status, router]);

  // Debounced username check
  useEffect(() => {
    if (!username) { setCheckStatus("idle"); setCheckMsg(""); return; }
    if (username === originalUsername) { setCheckStatus("same"); setCheckMsg(""); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setCheckStatus("checking");
    debounceRef.current = setTimeout(async () => {
      const res  = await fetch(`/api/auth/username?q=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.error)       { setCheckStatus("invalid");   setCheckMsg(data.error); }
      else if (data.available) { setCheckStatus("available"); setCheckMsg("Username is available!"); }
      else                  { setCheckStatus("taken");     setCheckMsg("Username already taken."); }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, originalUsername]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (checkStatus === "checking" || checkStatus === "taken" || checkStatus === "invalid") return;
    setSaving(true);
    setSaveError("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        ...(avatarUrl !== null && { avatarUrl }),
        username,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSaveError(data.error ?? "Failed to save.");
      setSaving(false);
      return;
    }
    await update();
    router.push("/admin");
  }

  const statusIcon = {
    idle:      null,
    same:      null,
    checking:  <FiLoader className="animate-spin text-[#9CA3AF]" size={14} />,
    available: <FiCheck className="text-[#1FAE7A]" size={14} />,
    taken:     <FiX className="text-[#B91C1C]" size={14} />,
    invalid:   <FiX className="text-[#B91C1C]" size={14} />,
  }[checkStatus];

  const usernameBorder = {
    idle:      "border-[#E5E7EB]",
    same:      "border-[#E5E7EB]",
    checking:  "border-[#D1D5DB]",
    available: "border-[#1FAE7A]",
    taken:     "border-[#B91C1C]",
    invalid:   "border-[#B91C1C]",
  }[checkStatus];

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-7 h-7 border-2 border-[#E5E7EB] border-t-[#1E3A8A] rounded-full animate-spin" />
      </div>
    );
  }

  const host = typeof window !== "undefined" ? window.location.host : "senlinks.app";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Edit Profile</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Update your public profile information.</p>
      </div>

      {/* Avatar section */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <p className="text-xs font-semibold text-[#374151] mb-4">Profile Photo</p>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <AvatarUploader
            currentUrl={avatarUrl}
            onUploaded={(url) => setAvatarUrl(url)}
            fallbackInitial={name || username || "?"}
          />
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Upload a photo from your device. Max 5 MB, image files only.
            </p>
            {/* Import from provider button */}
            {oauthAvatarUrl && oauthAvatarUrl !== avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(oauthAvatarUrl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1E3A8A] border border-[#1E3A8A]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
              >
                <FiDownload size={12} />
                Import from Google/GitHub
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5" htmlFor="profile-name">
            Display Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5" htmlFor="profile-username">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] select-none pointer-events-none">
              {host}/
            </span>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              maxLength={20}
              placeholder="yourname"
              className={`w-full pr-9 py-2.5 border-2 ${usernameBorder} rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 transition`}
              style={{ paddingLeft: `${host.length * 7.5 + 20}px` }}
            />
            {statusIcon && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">{statusIcon}</span>
            )}
          </div>
          {checkMsg && (
            <p className={`text-xs mt-1 ${checkStatus === "available" ? "text-[#1FAE7A]" : "text-[#B91C1C]"}`}>
              {checkMsg}
            </p>
          )}
          <p className="text-xs text-[#9CA3AF] mt-1">3–20 chars · letters, numbers, underscores</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5" htmlFor="profile-bio">
            Bio <span className="font-normal text-[#9CA3AF]">(optional)</span>
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Tell the world a little about yourself…"
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition resize-none"
          />
          <p className="text-xs text-[#9CA3AF] text-right">{bio.length}/160</p>
        </div>

        {saveError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-[#F9FAFB] transition"
          >
            Cancel
          </button>
          <button
            id="save-profile"
            type="submit"
            disabled={saving || checkStatus === "checking" || checkStatus === "taken" || checkStatus === "invalid"}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#15296B] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><FiLoader className="animate-spin" size={14} /> Saving…</>
            ) : (
              <><FiSave size={14} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
