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
  { id: "github",    label: "GitHub",    Icon: FaGithub    },
  { id: "twitter",   label: "Twitter/X", Icon: FaXTwitter  },
  { id: "instagram", label: "Instagram", Icon: FaInstagram },
  { id: "linkedin",  label: "LinkedIn",  Icon: FaLinkedin  },
  { id: "youtube",   label: "YouTube",   Icon: FaYoutube   },
  { id: "tiktok",    label: "TikTok",    Icon: FaTiktok    },
  { id: "facebook",  label: "Facebook",  Icon: FaFacebook  },
  { id: "snapchat",  label: "Snapchat",  Icon: FaSnapchat  },
  { id: "reddit",    label: "Reddit",    Icon: FaReddit    },
  { id: "pinterest", label: "Pinterest", Icon: FaPinterest },
  { id: "discord",   label: "Discord",   Icon: FaDiscord   },
  { id: "twitch",    label: "Twitch",    Icon: FaTwitch    },
  { id: "other",     label: "Other",     Icon: FaLink      },
];

function getPlatformMeta(platform: string) {
  return PLATFORMS.find((p) => p.id === platform.toLowerCase()) ?? { label: platform, Icon: FaLink };
}

interface SocialIconRowProps {
  icons: SocialIcon[];
  onDelete?: (id: string) => void;
  onAdd?: (platform: string, url: string, displayStyle: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function SocialIconRow({
  icons,
  onDelete,
  onAdd,
  isAdmin = false,
}: SocialIconRowProps) {
  const [showForm, setShowForm]       = useState(false);
  const [platform, setPlatform]       = useState("github");
  const [url, setUrl]                 = useState("");
  const [displayStyle, setDisplayStyle] = useState<"icon" | "button">("icon");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onAdd!(platform, url, displayStyle);
      setUrl("");
      setDisplayStyle("icon");
      setShowForm(false);
    } catch (err) {
      setError((err as Error).message ?? "Failed to add social link.");
    } finally {
      setLoading(false);
    }
  }

  // ── Public view ────────────────────────────────────────────────────────────
  if (!isAdmin) {
    const iconStyle   = icons.filter((i) => (i as SocialIcon & { displayStyle?: string }).displayStyle !== "button");
    const buttonStyle = icons.filter((i) => (i as SocialIcon & { displayStyle?: string }).displayStyle === "button");

    return (
      <div className="w-full space-y-3">
        {/* Icon row */}
        {iconStyle.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {iconStyle.map((icon) => {
              const { Icon } = getPlatformMeta(icon.platform);
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
        )}

        {/* Button-style social links */}
        {buttonStyle.length > 0 && (
          <div className="space-y-3">
            {buttonStyle.map((icon) => {
              const { Icon, label } = getPlatformMeta(icon.platform);
              return (
                <a
                  key={icon.id}
                  href={icon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-5 py-4 border border-[#E5E7EB] rounded-xl bg-white hover:bg-[#EEF2FF] hover:border-[#1E3A8A] hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3A8A] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon size={18} className="text-[#1E3A8A] ml-1 flex-shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-[#111827] group-hover:text-[#1E3A8A] transition-colors text-center">
                    {label}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Admin view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {icons.map((icon) => {
          const { Icon } = getPlatformMeta(icon.platform);
          const style = (icon as SocialIcon & { displayStyle?: string }).displayStyle ?? "icon";
          return (
            <div
              key={icon.id}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg bg-white"
            >
              <Icon size={15} className="text-[#1E3A8A] shrink-0" />
              <span className="text-sm text-[#111827] capitalize">{icon.platform}</span>
              {style === "button" && (
                <span className="text-[10px] font-medium text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                  btn
                </span>
              )}
              <button
                type="button"
                onClick={() => onDelete!(icon.id)}
                className="ml-1 text-[#B91C1C] hover:text-[#991B1B] text-base leading-none transition-colors"
                aria-label={`Remove ${icon.platform}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="space-y-3">
          {error && <p className="text-[#B91C1C] text-sm">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
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
              placeholder="https://github.com/yourname"
              className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
            />
          </div>

          {/* Display style toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setDisplayStyle("icon")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                displayStyle === "icon"
                  ? "bg-white text-[#1E3A8A] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              🔵 Icon only
            </button>
            <button
              type="button"
              onClick={() => setDisplayStyle("button")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                displayStyle === "button"
                  ? "bg-white text-[#1E3A8A] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              📋 Full button
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded-lg hover:bg-[#15296B] transition-colors disabled:opacity-50"
            >
              {loading ? "Adding…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 border border-dashed border-[#E5E7EB] text-[#6B7280] text-sm rounded-lg hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
        >
          + Add Social Link
        </button>
      )}
    </div>
  );
}
