"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FiUpload, FiUser, FiX } from "react-icons/fi";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface AvatarUploaderProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  fallbackInitial: string;
}

export default function AvatarUploader({
  currentUrl,
  onUploaded,
  fallbackInitial,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!e.target.files) return;
    // Reset input so the same file can be re-selected if needed
    e.target.value = "";

    if (!file) return;
    setError("");

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get signed upload auth from our server
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) {
        throw new Error("Failed to get upload credentials. Please try again.");
      }
      const { token, expire, signature, publicKey } = await authRes.json() as {
        token: string;
        expire: number;
        signature: string;
        publicKey: string;
      };

      // Step 2: Build a randomised filename to avoid conflicts
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `avatar_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      // Step 3: Upload directly from browser to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", String(expire));
      formData.append("token", token);
      formData.append("folder", "/avatars");

      const uploadRes = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) {
        const errBody = await uploadRes.json().catch(() => ({}));
        throw new Error(
          (errBody as { message?: string }).message ||
            "Upload failed. Please try again."
        );
      }

      const result = await uploadRes.json() as { url: string };
      setPreview(result.url);
      onUploaded(result.url);
    } catch (err) {
      setError((err as Error).message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar preview */}
      <div className="relative group">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            width={96}
            height={96}
            className="rounded-full object-cover border-2 border-[#E5E7EB] shadow-sm"
            unoptimized
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#1E3A8A] flex items-center justify-center border-2 border-[#E5E7EB] shadow-sm">
            {fallbackInitial ? (
              <span className="text-white text-3xl font-bold select-none">
                {fallbackInitial.charAt(0).toUpperCase()}
              </span>
            ) : (
              <FiUser size={36} className="text-white" />
            )}
          </div>
        )}

        {/* Overlay button */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity disabled:cursor-wait"
          aria-label="Upload photo"
        >
          {uploading ? (
            <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <FiUpload size={22} className="text-white" />
          )}
        </button>
      </div>

      {/* Upload button */}
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1E3A8A] border border-[#1E3A8A]/40 rounded-lg hover:bg-[#EEF2FF] transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {uploading ? (
          <>
            <span className="h-3 w-3 border-2 border-[#1E3A8A]/40 border-t-[#1E3A8A] rounded-full animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <FiUpload size={12} />
            Upload photo
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-[#B91C1C] bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-xs">
          <FiX size={13} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Select avatar image"
      />
    </div>
  );
}
