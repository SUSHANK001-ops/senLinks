import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNavClient from "./AdminNavClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-[#1E3A8A]">
              SenLinks
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors"
              >
                Links
              </Link>
              <Link
                href="/admin/analytics"
                className="px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/admin/display"
                className="px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors"
              >
                Display
              </Link>
              <Link
                href="/admin/profile"
                className="px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>
          <AdminNavClient session={session} />
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-[#E5E7EB]">
        <div className="flex">
          <Link
            href="/admin"
            className="flex-1 py-3 text-center text-sm font-medium text-[#6B7280] hover:text-[#111827] border-r border-[#E5E7EB] transition-colors"
          >
            Links
          </Link>
          <Link
            href="/admin/analytics"
            className="flex-1 py-3 text-center text-sm font-medium text-[#6B7280] hover:text-[#111827] border-r border-[#E5E7EB] transition-colors"
          >
            Analytics
          </Link>
          <Link
            href="/admin/display"
            className="flex-1 py-3 text-center text-sm font-medium text-[#6B7280] hover:text-[#111827] border-r border-[#E5E7EB] transition-colors"
          >
            Display
          </Link>
          <Link
            href="/admin/profile"
            className="flex-1 py-3 text-center text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
