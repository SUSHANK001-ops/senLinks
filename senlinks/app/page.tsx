import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SenLinks — Your Link in Bio, Simplified",
  description:
    "Create your free SenLinks profile and share all your important links in one place. Sign up with Google, GitHub, or email.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-[#1E3A8A] tracking-tight">
            SenLinks
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#1E3A8A] border border-[#1E3A8A] rounded hover:bg-[#1E3A8A] hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/login?tab=signup"
              className="px-4 py-2 text-sm font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#1E40AF] transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-block mb-4 px-3 py-1 text-xs font-semibold text-[#1E3A8A] bg-blue-50 border border-blue-200 rounded-full">
            Free for everyone
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#111827] leading-tight mb-6">
            One link.<br />
            <span className="text-[#1E3A8A]">Everything you share.</span>
          </h1>
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto mb-10 leading-relaxed">
            SenLinks gives you a beautiful, shareable profile page at{" "}
            <code className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] px-1.5 py-0.5 rounded">
              senlinks.sushanka.com.np/yourname
            </code>
            . Add links, track clicks, show your socials — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?tab=signup"
              className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#1E40AF] transition-colors"
            >
              Create Your Page — Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-[#1E3A8A] border border-[#1E3A8A] rounded hover:bg-[#1E3A8A] hover:text-white transition-colors"
            >
              Log In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-[#E5E7EB] bg-[#F9FAFB] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-[#111827] text-center mb-12">
              Everything you need, nothing you don&apos;t
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🔗",
                  title: "Unlimited Links",
                  desc: "Add as many links as you need. Reorder them with drag and drop.",
                },
                {
                  icon: "📊",
                  title: "Click Analytics",
                  desc: "See which links get clicks, where visitors come from, and what devices they use.",
                },
                {
                  icon: "⏰",
                  title: "Scheduled Links",
                  desc: "Set start and expiry dates on links. Perfect for time-limited promotions.",
                },
                {
                  icon: "🌐",
                  title: "Social Icons",
                  desc: "Show your social profiles with beautiful icons from GitHub to TikTok.",
                },
                {
                  icon: "🔐",
                  title: "Secure Auth",
                  desc: "Sign in with Google, GitHub, or email and password — your choice.",
                },
                {
                  icon: "📱",
                  title: "Mobile First",
                  desc: "Your profile looks great on any screen, from phones to desktops.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-white border border-[#E5E7EB] rounded p-6"
                >
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#1E3A8A]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to simplify your online presence?
            </h2>
            <p className="text-blue-200 mb-8">
              Create your free SenLinks page in under a minute.
            </p>
            <Link
              href="/login?tab=signup"
              className="inline-block px-8 py-3 text-sm font-semibold text-[#1E3A8A] bg-white rounded hover:bg-[#F9FAFB] transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-[#1E3A8A]">SenLinks</span>
          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} SenLinks · senlinks.sushanka.com.np
          </p>
        </div>
      </footer>
    </div>
  );
}
