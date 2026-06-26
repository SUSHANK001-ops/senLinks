import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Not Found — SenLinks",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-bold text-[#1E3A8A] mb-4">404</p>
        <h1 className="text-xl font-bold text-[#111827] mb-2">
          Profile not found
        </h1>
        <p className="text-sm text-[#6B7280] mb-8">
          This username doesn&apos;t exist on SenLinks, or the profile has been removed.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#1E3A8A] text-white text-sm font-medium rounded hover:bg-[#1E40AF] transition-colors"
        >
          Go to SenLinks
        </Link>
      </div>
    </div>
  );
}
