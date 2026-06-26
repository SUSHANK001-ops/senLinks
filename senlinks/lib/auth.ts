import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

/** Generate a unique username from a display name */
async function generateUniqueUsername(baseName: string): Promise<string> {
  // Sanitize: lowercase, strip non-alphanumeric, truncate
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  const base = sanitized || "user";

  // Check if base is free
  const existing = await prisma.user.findUnique({ where: { username: base } });
  if (!existing) return base;

  // Append random 4-digit suffix until unique
  for (let i = 0; i < 10; i++) {
    const candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }

  // Fallback: timestamp-based
  return `${base}${Date.now()}`;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        return valid ? user : null;
      },
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // Fetch username from DB since NextAuth session doesn't include it by default
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true },
        });
        (session.user as typeof session.user & { username: string }).username =
          dbUser?.username ?? "";
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, ensure the user gets a unique username
      if (account?.provider !== "credentials" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          select: { username: true },
        });
        if (!existing?.username) {
          const username = await generateUniqueUsername(
            user.name ?? user.email.split("@")[0]
          );
          await prisma.user.update({
            where: { email: user.email },
            data: { username },
          });
        }
      }
      return true;
    },
  },
};
