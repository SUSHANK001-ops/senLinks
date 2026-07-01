import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";

/** Build a temporary unique username from the OAuth display name */
function tempUsername(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  const base =
    name
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15) ||
    email
      ?.split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15) ||
    "user";
  return `${base}_${createId().slice(0, 6)}`;
}

function buildAdapter() {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    // Intercept createUser to inject username + snapshot oauthAvatarUrl
    async createUser(data: Parameters<NonNullable<typeof base.createUser>>[0]) {
      const username = tempUsername(data.name, data.email);
      // AdapterUser doesn't have an index signature, go through unknown
      const raw = data as unknown as Record<string, unknown>;
      const { image, emailVerified, ...rest } = raw;
      return base.createUser!({
        ...rest,
        username,
        usernameSet: false,
        avatarUrl: (image as string) ?? null,
        oauthAvatarUrl: (image as string) ?? null,
      } as unknown as Parameters<NonNullable<typeof base.createUser>>[0]);
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
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60,   // 7 days
    updateAge: 24 * 60 * 60,    // refresh once per day
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true, usernameSet: true, oauthAvatarUrl: true },
        });
        session.user.username = dbUser?.username ?? "";
        session.user.usernameSet = dbUser?.usernameSet ?? false;
        session.user.oauthAvatarUrl = dbUser?.oauthAvatarUrl ?? null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
