import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";

/** Build a temporary unique username from the OAuth display name */
function tempUsername(name: string | null | undefined, email: string | null | undefined): string {
  const base =
    name
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15) ||
    email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) ||
    "user";
  // Append a short random suffix to ensure uniqueness
  return `${base}_${createId().slice(0, 6)}`;
}

function buildAdapter() {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    // Intercept createUser to inject a username and map OAuth fields to our schema
    async createUser(data: Parameters<typeof base.createUser>[0]) {
      const username = tempUsername(data.name, data.email);
      // Auth.js sends `image` and `emailVerified`, but our Prisma schema
      // uses `avatarUrl` and has no `emailVerified` column.
      const { image, emailVerified, ...rest } = data as Record<string, unknown>;
      return base.createUser({
        ...rest,
        username,
        avatarUrl: (image as string) ?? null,
      } as Parameters<typeof base.createUser>[0]);
    },
  };
}

const config: NextAuthConfig = {
  adapter: buildAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true },
        });
        (session.user as typeof session.user & { username: string }).username =
          dbUser?.username ?? "";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
