"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

export default function AdminNavClient({ session }: { session: Session }) {
  const username = (session.user as Session["user"] & { username?: string })?.username;

  return (
    <div className="flex items-center gap-3">
      {username && (
        <Link
          href={`/${username}`}
          target="_blank"
          className="hidden sm:block px-3 py-1.5 text-xs font-medium text-[#1E3A8A] border border-[#1E3A8A] rounded hover:bg-[#1E3A8A] hover:text-white transition-colors"
        >
          View Profile ↗
        </Link>
      )}
      <span className="hidden sm:block text-sm text-[#6B7280] max-w-[140px] truncate">
        {session.user?.email}
      </span>
      <button
        type="button"
        id="admin-logout"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-3 py-1.5 text-xs font-medium text-[#B91C1C] border border-[#B91C1C] rounded hover:bg-[#B91C1C] hover:text-white transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
