import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Display — SenLinks",
};

export default function DisplayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Display</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Customize how your profile looks
        </p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded p-8 text-center">
        <div className="text-4xl mb-4">🎨</div>
        <h2 className="text-base font-semibold text-[#111827] mb-2">
          Coming in Part 2
        </h2>
        <p className="text-sm text-[#6B7280] max-w-sm mx-auto leading-relaxed">
          The Display section will let you choose between a standard link view,
          a full-width photo background, or a canvas mode for custom artwork.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[
            { mode: "Default", icon: "🔗", desc: "Clean links list" },
            { mode: "Photo", icon: "🖼️", desc: "Background photo" },
            { mode: "Canvas", icon: "✏️", desc: "Custom artwork" },
          ].map(({ mode, icon, desc }) => (
            <div
              key={mode}
              className="border border-[#E5E7EB] rounded p-3 bg-[#F9FAFB] opacity-50"
            >
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-xs font-medium text-[#111827]">{mode}</p>
              <p className="text-[10px] text-[#6B7280]">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/admin"
            className="text-sm text-[#1E3A8A] hover:text-[#1E40AF] transition-colors"
          >
            ← Back to Links
          </Link>
        </div>
      </div>
    </div>
  );
}
