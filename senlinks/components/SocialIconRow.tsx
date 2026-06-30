"use client";

import { useState } from "react";
import {
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaFacebook,
  FaLink,
  FaSnapchat,
  FaReddit,
  FaPinterest,
  FaDiscord,
  FaTwitch,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { SocialIcon } from "@prisma/client";

const PLATFORMS = [
  { id: "github", label: "GitHub", Icon: FaGithub },
  { id: "twitter", label: "Twitter/X", Icon: FaXTwitter },
  { id: "instagram", label: "Instagram", Icon: FaInstagram },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { id: "youtube", label: "YouTube", Icon: FaYoutube },
  { id: "tiktok", label: "TikTok", Icon: FaTiktok },
  { id: "facebook", label: "Facebook", Icon: FaFacebook },
  { id: "snapchat", label: "Snapchat", Icon: FaSnapchat },
  { id: "reddit", label: "Reddit", Icon: FaReddit },
  { id: "pinterest", label: "Pinterest", Icon: FaPinterest },
  { id: "discord", label: "Discord", Icon: FaDiscord },
  { id: "twitch", label: "Twitch", Icon: FaTwitch },
  { id: "other", label: "Other", Icon: FaLink },
];

function getPlatformIcon(platform: string) {
  const found = PLATFORMS.find((p) => p.id === platform.toLowerCase());
  if (!found) return FaLink;
  return found.Icon;
}

interface SocialIconRowProps {
  icons: SocialIcon[];
  onDelete?: (id: string) => void;
  onAdd?: (platform: string, url: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function SocialIconRow({
  icons,
  onDelete,
  onAdd,
  isAdmin = false,
}: SocialIconRowProps) {
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState("github");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onAdd(platform, url);
      setUrl("");
      setShowForm(false);
    } catch (err) {
      setError((err as Error).message ?? "Failed to add social icon.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    // Public view — just show icon links
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {icons.map((icon) => {
          const Icon = getPlatformIcon(icon.platform);
          return (
            <a
              key={icon.id}
              href={icon.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={icon.platform}
              className="text-[#1E3A8A] hover:text-[#1E40AF] transition-colors"
            >
              <Icon size={24} />
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {icons.map((icon) => {
          const Icon = getPlatformIcon(icon.platform);
          return (
            <div
              key={icon.id}
              className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded bg-white"
            >
              <Icon size={18} className="text-[#1E3A8A]" />
              <span className="text-sm text-[#111827] capitalize">
                {icon.platform}
              </span>
              <button
                type="button"
                onClick={() => onDelete(icon.id)}
                className="ml-1 text-[#B91C1C] hover:text-[#991B1B] text-sm font-medium transition-colors"
                aria-label={`Remove ${icon.platform}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          {error && (
            <p className="text-[#B91C1C] text-sm col-span-full">{error}</p>
          )}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://github.com/yourusername"
            className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded hover:bg-[#1E40AF] transition-colors disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 border border-dashed border-[#E5E7EB] text-[#6B7280] text-sm rounded hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
        >
          + Add Social Link
        </button>
      )}
    </div>
  );
}
