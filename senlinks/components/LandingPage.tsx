"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Globe,
  ShoppingBag,
  BarChart3,
  Mail,
  Play,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";

// ─── Chip data ────────────────────────────────────────────────────────────────
type ChipColorKey = "coral" | "mint" | "amber" | "navy";

const CHIP_COLORS: Record<ChipColorKey, string> = {
  coral: "#FF5A5F",
  mint:  "#1FAE7A",
  amber: "#F5A623",
  navy:  "#1E3A8A",
};

interface ChipDef {
  Icon: LucideIcon;
  label: string;
  color: ChipColorKey;
  scatter: { x: number; y: number; r: number };
}

const CHIPS: ChipDef[] = [
  { Icon: Globe,       label: "Instagram",  color: "coral", scatter: { x: 18,  y: -25, r: -14 } },
  { Icon: ShoppingBag, label: "My Shop",    color: "amber", scatter: { x: -22, y: -8,  r: 11  } },
  { Icon: BarChart3,   label: "Portfolio",  color: "mint",  scatter: { x: 14,  y:  8,  r: -7  } },
  { Icon: Mail,        label: "Newsletter", color: "navy",  scatter: { x: -18, y: 18,  r: 9   } },
  { Icon: Play,        label: "YouTube",    color: "coral", scatter: { x: 10,  y:  28, r: -4  } },
];

// ─── Mock panel data ──────────────────────────────────────────────────────────
const ANALYTICS_ROWS = [
  { country: "US", pct: 42, color: "#1E3A8A" },
  { country: "UK", pct: 18, color: "#1FAE7A" },
  { country: "NP", pct: 15, color: "#FF5A5F" },
  { country: "CA", pct: 11, color: "#F5A623" },
];

const PROFILE_LINKS = [
  { label: "Portfolio",  bg: "#1FAE7A" },
  { label: "My Shop",    bg: "#F5A623" },
  { label: "Newsletter", bg: "#FF5A5F" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const chipRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef    = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const navRef     = useRef<HTMLElement>(null);
  const [host, setHost] = useState("senlinks.app");

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  // Chip scatter → settle + cursor tilt
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Settle animation
    chipRefs.current.forEach((chip, i) => {
      if (!chip) return;
      const { x, y, r } = CHIPS[i].scatter;
      if (!reduced) {
        gsap.fromTo(
          chip,
          { x, y, rotate: r, opacity: 0 },
          {
            x: 0, y: 0, rotate: 0, opacity: 1,
            duration: 0.6,
            delay: 0.15 + 0.1 * i,
            ease: "power2.out",
          }
        );
      } else {
        gsap.set(chip, { opacity: 1 });
      }
    });

    if (reduced || !heroRef.current) return;

    // Cursor tilt with lerp smoothing
    const hero = heroRef.current;
    const setters = chipRefs.current.map((chip) =>
      chip
        ? {
            ry: gsap.quickSetter(chip, "rotateY", "deg"),
            rx: gsap.quickSetter(chip, "rotateX", "deg"),
          }
        : null
    );

    // Current smoothed values per chip
    const current = chipRefs.current.map(() => ({ rx: 0, ry: 0 }));
    let target = { dx: 0, dy: 0 };
    let rafId = 0;
    const LERP = 0.1;

    const tick = () => {
      setters.forEach((qt, i) => {
        if (!qt) return;
        const deg = 12 + (i % 3) * 3; // 12–18°
        const targetRy = target.dx * deg;
        const targetRx = -target.dy * deg;
        current[i].ry += (targetRy - current[i].ry) * LERP;
        current[i].rx += (targetRx - current[i].rx) * LERP;
        qt.ry(current[i].ry);
        qt.rx(current[i].rx);
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      target.dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
      target.dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    };

    const onLeave = () => {
      target = { dx: 0, dy: 0 };
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Scroll-triggered panel animation
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = sectionRef.current;
    if (!el) return;

    // Set panels invisible before they animate in
    panelRefs.current.forEach((p) => {
      if (p) gsap.set(p, { opacity: 0, y: reduced ? 0 : 24 });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          panelRefs.current.forEach((p, i) => {
            if (!p) return;
            gsap.to(p, {
              opacity: 1, y: 0,
              duration: 0.4,
              delay: 0.08 * i,
              ease: "power2.out",
            });
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Nav scroll border
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav ref={navRef} className="sticky top-0 z-50 bg-white nav-landing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-navy tracking-tight">
            SenLinks
          </span>
          <div className="flex items-center gap-3">
            <Link
              id="nav-login"
              href="/login"
              className="px-4 py-2 text-sm font-medium text-navy border border-navy rounded hover:bg-navy hover:text-white transition-colors duration-150"
            >
              Log in
            </Link>
            <Link
              id="nav-signup"
              href="/login?tab=signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-navy rounded hover:bg-navy-deep transition-colors duration-150"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
          style={{ perspective: "800px" }}
        >
          {/* Left: copy */}
          <div className="flex-1 min-w-0 lg:max-w-lg">
            <h1 className="font-display text-[clamp(2.25rem,5vw,5rem)] font-extrabold text-ink leading-[1.05] tracking-tight mb-6">
              One link.<br />
              <span className="text-navy">
                Everything you<br className="hidden sm:block" /> run into.
              </span>
            </h1>

            <div
              className="inline-flex items-center gap-1 mb-8 px-3 py-1.5 bg-surface border border-border rounded text-xs text-muted"
              style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
            >
              {host}/
              <span className="text-navy font-medium">yourname</span>
            </div>

            <div>
              <Link
                id="hero-cta"
                href="/login?tab=signup"
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-navy rounded hover:bg-navy-deep transition-all duration-150 hover:scale-[1.02]"
              >
                Create your page
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
            </div>
          </div>

          {/* Right: chip stack */}
          <div
            className="flex-shrink-0 flex flex-col gap-3 w-64"
            style={{ transformStyle: "preserve-3d" }}
          >
            {CHIPS.map(({ Icon, label, color }, i) => (
              <div
                key={label}
                ref={(el) => { chipRefs.current[i] = el; }}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-sm cursor-default select-none opacity-0"
                style={{
                  backgroundColor: CHIP_COLORS[color],
                  color: "#fff",
                  transformStyle: "preserve-3d",
                }}
              >
                <Icon size={20} strokeWidth={1.75} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: How it stacks up ──────────────────────────────────────── */}
        <section className="border-t border-border bg-surface py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ink text-center mb-4">
              How it stacks up
            </h2>
            <p className="text-center text-muted mb-14 max-w-xl mx-auto leading-relaxed">
              Click analytics with country &amp; device breakdown. Scheduled links with
              start/expiry dates. Sign in with Google, GitHub, or email — your choice.
            </p>

            <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Panel 1: Add a link */}
              <div
                ref={(el) => { panelRefs.current[0] = el; }}
                className="bg-white border border-border rounded-xl p-5 shadow-sm"
              >
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
                  Add a link
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-medium text-muted mb-1">Title</p>
                    <div className="h-8 bg-surface border border-border rounded px-3 flex items-center">
                      <span className="text-xs text-muted">My Portfolio</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted mb-1">URL</p>
                    <div className="h-8 bg-surface border border-border rounded px-3 flex items-center">
                      <span className="text-xs text-muted">https://sushanka.dev</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <div
                      className="flex-1 h-7 rounded px-2 flex items-center"
                      style={{ backgroundColor: "#F0FFF8", border: "1px solid #1FAE7A44" }}
                    >
                      <span className="text-[10px] font-medium" style={{ color: "#1FAE7A" }}>
                        Starts Jun 1
                      </span>
                    </div>
                    <div
                      className="flex-1 h-7 rounded px-2 flex items-center"
                      style={{ backgroundColor: "#FFFBEB", border: "1px solid #F5A62344" }}
                    >
                      <span className="text-[10px] font-medium" style={{ color: "#F5A623" }}>
                        Expires Jul 1
                      </span>
                    </div>
                  </div>
                  <div className="h-8 bg-navy rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">+ Add Link</span>
                  </div>
                </div>
              </div>

              {/* Panel 2: Public profile */}
              <div
                ref={(el) => { panelRefs.current[1] = el; }}
                className="bg-white border border-border rounded-xl p-5 shadow-sm"
              >
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
                  Your profile
                </p>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-navy mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="text-xs font-semibold text-ink">@sushanka</span>
                  <span className="text-[10px] text-muted mt-0.5">Developer · Creator</span>
                </div>
                <div className="space-y-2">
                  {PROFILE_LINKS.map(({ label, bg }) => (
                    <div
                      key={label}
                      className="h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: bg }}
                    >
                      <span className="text-xs font-semibold text-white">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 3: Analytics */}
              <div
                ref={(el) => { panelRefs.current[2] = el; }}
                className="bg-white border border-border rounded-xl p-5 shadow-sm"
              >
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
                  Click analytics
                </p>
                <div className="space-y-2.5 mb-5">
                  {ANALYTICS_ROWS.map(({ country, pct, color }) => (
                    <div key={country} className="flex items-center gap-2">
                      <span
                        className="text-[10px] text-muted w-5 shrink-0"
                        style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
                      >
                        {country}
                      </span>
                      <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-[10px] text-muted w-7 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 border-t border-border pt-3">
                  {[
                    { label: "Mobile",  value: "68%" },
                    { label: "Desktop", value: "32%" },
                    { label: "Referrer",value: "ig"  },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex-1 bg-surface rounded p-2 text-center">
                      <p className="text-[10px] text-muted">{label}</p>
                      <p className="text-xs font-bold text-ink">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Band ─────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-navy">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-10 leading-tight">
              Your links already exist.<br />
              Stop pasting them everywhere.
            </h2>
            <Link
              id="cta-signup"
              href="/login?tab=signup"
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-navy bg-white rounded hover:bg-surface transition-all duration-150 hover:scale-[1.02]"
            >
              Create Your Page — Free
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-bold text-navy">SenLinks</span>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} SenLinks · senlinks.sushanka.com.np
          </p>
        </div>
      </footer>

    </div>
  );
}
