import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import SocialIconRow from "@/components/SocialIconRow";
import Image from "next/image";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, bio: true, username: true },
  });

  if (!user) return { title: "Profile Not Found — SenLinks" };

  return {
    title: `${user.name ?? user.username} — SenLinks`,
    description: user.bio ?? `Check out ${user.name ?? user.username}'s links on SenLinks.`,
    openGraph: {
      title: `${user.name ?? user.username} on SenLinks`,
      description: user.bio ?? undefined,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      links: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      socialIcons: {
        orderBy: { platform: "asc" },
      },
    },
  });

  if (!user) notFound();

  const now = new Date();

  // Filter by schedule
  const activeLinks = user.links.filter((link) => {
    if (link.startsAt && now < link.startsAt) return false;
    if (link.expiresAt && now > link.expiresAt) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name ?? username}
              width={88}
              height={88}
              className="rounded-full border-2 border-[#E5E7EB] mb-4 object-cover"
            />
          ) : (
            <div className="w-22 h-22 rounded-full bg-[#1E3A8A] flex items-center justify-center mb-4 border-2 border-[#E5E7EB]"
                 style={{ width: 88, height: 88 }}>
              <span className="text-3xl font-bold text-white">
                {(user.name ?? username).charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="text-xl font-bold text-[#111827] text-center">
            {user.name ?? `@${username}`}
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">@{username}</p>

          {user.bio && (
            <p className="text-sm text-[#6B7280] text-center mt-3 max-w-xs leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Social icons */}
          {user.socialIcons.length > 0 && (
            <div className="mt-4">
              <SocialIconRow
                icons={user.socialIcons}
                onDelete={() => {}}
                onAdd={async () => {}}
                isAdmin={false}
              />
            </div>
          )}
        </div>

        {/* Links */}
        {activeLinks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#6B7280]">No links added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLinks.map((link) => (
              <a
                key={link.id}
                href={`/api/click/${link.id}`}
                className="flex items-center gap-3 w-full px-5 py-4 border border-[#E5E7EB] rounded bg-white hover:bg-[#F9FAFB] hover:border-[#1E3A8A] transition-colors group"
              >
                {link.icon && (
                  <span className="text-lg flex-shrink-0">{link.icon}</span>
                )}
                <span className="flex-1 text-sm font-medium text-[#111827] group-hover:text-[#1E3A8A] transition-colors text-center">
                  {link.title}
                </span>
                <span className="flex-shrink-0 text-[#6B7280] group-hover:text-[#1E3A8A] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-xs text-[#6B7280] hover:text-[#1E3A8A] transition-colors"
          >
            Powered by <span className="font-semibold text-[#1E3A8A]">SenLinks</span>
          </a>
        </div>
      </div>
    </div>
  );
}
