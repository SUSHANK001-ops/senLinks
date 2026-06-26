"use client";

import { useState } from "react";
import type { Link } from "@prisma/client";

interface AdminLinkFormProps {
  link?: Link;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLinkForm({
  link,
  onSuccess,
  onCancel,
}: AdminLinkFormProps) {
  const isEditing = !!link;

  const [title, setTitle] = useState(link?.title ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [icon, setIcon] = useState(link?.icon ?? "");
  const [startsAt, setStartsAt] = useState(
    link?.startsAt ? new Date(link.startsAt).toISOString().slice(0, 16) : ""
  );
  const [expiresAt, setExpiresAt] = useState(
    link?.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      title,
      url,
      icon: icon || null,
      startsAt: startsAt || null,
      expiresAt: expiresAt || null,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/links/${link.id}` : "/api/links",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md mx-4 rounded-lg border border-[#E5E7EB] shadow-xl">
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-semibold text-[#111827]">
            {isEditing ? "Edit Link" : "Add New Link"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-[#B91C1C] text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="link-title"
              className="block text-sm font-medium text-[#111827] mb-1"
            >
              Title <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. My Portfolio"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="link-url"
              className="block text-sm font-medium text-[#111827] mb-1"
            >
              URL <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="link-icon"
              className="block text-sm font-medium text-[#111827] mb-1"
            >
              Icon (emoji or text)
            </label>
            <input
              id="link-icon"
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. 🔗"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="link-starts-at"
                className="block text-sm font-medium text-[#111827] mb-1"
              >
                Starts At
              </label>
              <input
                id="link-starts-at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="link-expires-at"
                className="block text-sm font-medium text-[#111827] mb-1"
              >
                Expires At
              </label>
              <input
                id="link-expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded hover:bg-[#1E40AF] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving…" : isEditing ? "Save Changes" : "Add Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
