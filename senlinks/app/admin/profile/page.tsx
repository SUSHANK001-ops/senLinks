"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiCheck, FiX, FiLoader, FiSave, FiUser } from "react-icons/fi";

type CheckStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "same";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [checkMsg, setCheckMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

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
        setAvatarUrl(user.avatarUrl ?? "");
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
      const res = await fetch(`/api/auth/username?q=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.error) { setCheckStatus("invalid"); setCheckMsg(data.error); }
      else if (data.available) { setCheckStatus("available"); setCheckMsg("Username is available!"); }
      else { setCheckStatus("taken"); setCheckMsg("Username already taken."); }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, originalUsername]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (checkStatus === "checking" || checkStatus === "taken" || checkStatus === "invalid") return;
    setSaving(true); setSaved(false); setSaveError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, avatarUrl, username }),
    });
    const data = await res.json();
    if (!res.ok) { setSaveError(data.error ?? "Failed to save."); setSaving(false); return; }
    setOriginalUsername(data.user.username);
    await update();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const statusIcon = {
    idle: null,
    same: null,
    checking: <FiLoader className="animate-spin text-white/40" size={14} />,
    available: <FiCheck className="text-emerald-400" size={14} />,
    taken: <FiX className="text-red-400" size={14} />,
    invalid: <FiX className="text-red-400" size={14} />,
  }[checkStatus];

  const usernameBorder = {
    idle: "border-white/10",
    same: "border-white/10",
    checking: "border-white/20",
    available: "border-emerald-500/50",
    taken: "border-red-500/50",
    invalid: "border-red-500/50",
  }[checkStatus];

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-7 h-7 border-2 border-[#E5E7EB] border-t-[#1E3A8A] rounded-full animate-spin" />
      </div>
    );
  }

  const host = typeof window !== "undefined" ? window.location.host : "senlinks.app";
  const displayAvatar = avatarUrl || session?.user?.image || "";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Edit Profile</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Update your public profile information.</p>
      </div>

      {/* Avatar preview */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt="Avatar"
              width={72}
              height={72}
              className="rounded-full object-cover border-2 border-[#E5E7EB]"
              unoptimized={displayAvatar.startsWith("http")}
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-[#1E3A8A] flex items-center justify-center border-2 border-[#E5E7EB]">
              <FiUser size={28} className="text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#111827] truncate">{name || "—"}</p>
          <p className="text-sm text-[#6B7280] truncate">@{username}</p>
          {bio && <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2">{bio}</p>}
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
              className={`w-full pl-[${host.length * 8 + 24}px] pr-9 py-2.5 border ${usernameBorder} rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 transition`}
              style={{ paddingLeft: `${host.length * 7.5 + 20}px` }}
            />
            {statusIcon && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">{statusIcon}</span>
            )}
          </div>
          {checkMsg && (
            <p className={`text-xs mt-1 ${checkStatus === "available" ? "text-emerald-600" : "text-red-500"}`}>
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

        {/* Avatar URL */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5" htmlFor="profile-avatar">
            Avatar URL <span className="font-normal text-[#9CA3AF]">(optional)</span>
          </label>
          <input
            id="profile-avatar"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition"
          />
        </div>

        {saveError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          {saved ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <FiCheck size={14} /> Saved!
            </span>
          ) : <span />}
          <button
            id="save-profile"
            type="submit"
            disabled={saving || checkStatus === "checking" || checkStatus === "taken" || checkStatus === "invalid"}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
