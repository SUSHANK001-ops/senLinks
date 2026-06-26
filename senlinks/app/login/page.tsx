"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaGithub, FaGoogle } from "react-icons/fa";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "signup") setTab("signup");
    else setTab("login");
  }, [searchParams]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });
    setLoginLoading(false);
    if (result?.error) {
      setLoginError("Invalid email or password.");
    } else {
      router.push("/admin");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSignupError(data.error ?? "Registration failed.");
        setSignupLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email: signupEmail,
        password: signupPassword,
        redirect: false,
      });
      setSignupLoading(false);
      if (result?.error) {
        setTab("login");
      } else {
        router.push("/admin");
      }
    } catch {
      setSignupError("Network error. Please try again.");
      setSignupLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    await signIn(provider, { callbackUrl: "/admin" });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold text-[#1E3A8A]">
            SenLinks
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Tabs */}
          <div className="flex border border-[#E5E7EB] rounded mb-6 overflow-hidden">
            <button
              type="button"
              id="login-tab"
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-[#1E3A8A] text-white"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              id="signup-tab"
              onClick={() => setTab("signup")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "signup"
                  ? "bg-[#1E3A8A] text-white"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded p-6 space-y-4">
            {/* OAuth buttons */}
            <div className="space-y-2">
              <button
                type="button"
                id="google-signin"
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] transition-colors"
              >
                <FaGoogle size={16} className="text-[#B91C1C]" />
                Continue with Google
              </button>
              <button
                type="button"
                id="github-signin"
                onClick={() => handleOAuth("github")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] transition-colors"
              >
                <FaGithub size={16} />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <hr className="flex-1 border-[#E5E7EB]" />
              <span className="text-xs text-[#6B7280]">or</span>
              <hr className="flex-1 border-[#E5E7EB]" />
            </div>

            {/* Credentials form */}
            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3" id="login-form">
                {loginError && (
                  <p className="text-[#B91C1C] text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
                    {loginError}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-medium text-[#111827] mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-medium text-[#111827] mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-medium rounded hover:bg-[#1E40AF] transition-colors disabled:opacity-50"
                >
                  {loginLoading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3" id="signup-form">
                {signupError && (
                  <p className="text-[#B91C1C] text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
                    {signupError}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-medium text-[#111827] mb-1"
                  >
                    Name (optional)
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-medium text-[#111827] mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-medium text-[#111827] mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <button
                  id="signup-submit"
                  type="submit"
                  disabled={signupLoading}
                  className="w-full px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-medium rounded hover:bg-[#1E40AF] transition-colors disabled:opacity-50"
                >
                  {signupLoading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
