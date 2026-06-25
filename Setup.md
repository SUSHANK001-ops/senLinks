# SenLinks — Part 1: Setup & Base Build
**Domain:** senlinks.sushanka.com.np
**Stack:** Next.js (full-stack), PostgreSQL, Prisma, NextAuth (Google + GitHub + Credentials)
**Style:** Flat colors only — navy blue primary, white background, red for destructive actions. No gradients.

> Note: adding Google/GitHub login means this becomes multi-user by default — anyone can sign in and create their own page. If you actually want single-admin-only, say so and we lock signup to your account regardless of provider.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js latest (App Router), TypeScript | One codebase, frontend + backend |
| Database | PostgreSQL via Neon | Free tier, serverless |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | NextAuth.js — Google, GitHub, Credentials | Social login + fallback email/password |
| Styling | Tailwind CSS | Enforces flat-color discipline via config |
| File storage | Vercel Blob (photos, drawings) | Don't store binary in Postgres |
| Hosting | Vercel | Free tier, custom subdomain support |

---

## 2. Color System (`tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `background` | `#FFFFFF` | Page background |
| `primary` | `#1E3A8A` | Buttons, links, headers |
| `primary-hover` | `#1E40AF` | Hover state |
| `text` | `#111827` | Body text |
| `text-muted` | `#6B7280` | Secondary text |
| `border` | `#E5E7EB` | Dividers, card borders |
| `danger` | `#B91C1C` | Delete/destructive actions only |

Rule: no `bg-gradient-*` anywhere. Flat fills only.

---

## 3. Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  username      String   @unique
  email         String   @unique
  password      String?  // null if OAuth-only
  name          String?
  bio           String?
  avatarUrl     String?
  links         Link[]
  socialIcons   SocialIcon[]
  accounts      Account[]
  sessions      Session[]
  displaySection DisplaySection?
  createdAt     DateTime @default(now())
}

// NextAuth required models for OAuth
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Link {
  id         String     @id @default(cuid())
  title      String
  url        String
  icon       String?
  order      Int        @default(0)
  isActive   Boolean    @default(true)
  clicks     Int        @default(0)
  startsAt   DateTime?
  expiresAt  DateTime?
  userId     String
  user       User       @relation(fields: [userId], references: [id])
  clickLogs  ClickLog[]
}

model ClickLog {
  id        String   @id @default(cuid())
  linkId    String
  link      Link     @relation(fields: [linkId], references: [id])
  country   String?
  device    String?
  referrer  String?
  createdAt DateTime @default(now())
}

model SocialIcon {
  id       String @id @default(cuid())
  platform String
  url      String
  userId   String
  user     User   @relation(fields: [userId], references: [id])
}

// Covered in detail in Part 2 — declared here since it belongs to base schema
model DisplaySection {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  mode      String   @default("default") // "default" | "photo" | "canvas"
  photoUrl  String?
  canvasData Json?
  updatedAt DateTime @updatedAt
}
```

---

## 4. Auth Setup (Google + GitHub + Credentials)

### 4.1 Get OAuth credentials
- **Google:** Google Cloud Console → Create OAuth 2.0 Client ID → Authorized redirect URI: `https://senlinks.sushanka.com.np/api/auth/callback/google`
- **GitHub:** GitHub Settings → Developer settings → OAuth Apps → Callback URL: `https://senlinks.sushanka.com.np/api/auth/callback/github`

### 4.2 Env vars
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://senlinks.sushanka.com.np
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 4.3 `lib/auth.ts`
```ts
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
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
        const user = await prisma.user.findUnique({ where: { email: credentials!.email } });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials!.password, user.password);
        return valid ? user : null;
      },
    }),
  ],
  session: { strategy: "database" as const },
  pages: { signIn: "/login" },
};
```

**Key risk to know:** `PrismaAdapter` requires the `Account`/`Session` models exactly as NextAuth expects — don't rename fields. If a username isn't unique on OAuth signup (e.g. two "John Smith"s from Google), you need a callback to auto-generate a unique username (e.g. append random suffix) before the user record is created. Don't skip this — it will break in production with real users, not in your testing with one account.

---

## 5. Folder Structure

```
/app
  /page.tsx                      → public profile page (root, generic)
  /[username]/page.tsx           → public profile page per user (multi-user)
  /admin
    /page.tsx
    /analytics/page.tsx
    /display/page.tsx            → Part 2 feature
  /login/page.tsx
  /api
    /auth/[...nextauth]/route.ts
    /links/route.ts
    /links/[id]/route.ts
    /links/reorder/route.ts
    /click/[id]/route.ts
    /display/route.ts            → Part 2 feature
/components
  /LinkCard.tsx
  /AdminLinkForm.tsx
  /AnalyticsChart.tsx
  /SocialIconRow.tsx
/lib
  /prisma.ts
  /auth.ts
  /rate-limit.ts
/prisma
  /schema.prisma
```

Note the route change from Part 1's original single-user assumption: `/[username]` is now needed since OAuth signup means multiple people will have profiles. `senlinks.sushanka.com.np` becomes either a landing/signup page or redirects to your own `/[your-username]`, depending on what you want it to do — decide this before launch.

---

## 6. Build Order

1. `npx create-next-app@latest` — TypeScript, Tailwind, App Router
2. Set up Neon Postgres + Prisma, run first migration
3. Install `next-auth`, `@auth/prisma-adapter`, `bcrypt`
4. Configure Google + GitHub OAuth apps, add Credentials provider, build `/login`
5. Add unique-username generation callback for OAuth signups
6. Admin CRUD: links list, add/edit form, delete with confirm (red button)
7. Drag-and-drop reorder (`dnd-kit`)
8. Public `/[username]` page — server component, flat blue/white styling
9. `/api/click/[id]` — rate-limit, log, increment, redirect
10. Analytics dashboard
11. Social icon row
12. Deploy to Vercel, set env vars
13. Add custom domain in Vercel settings, point DNS

---

## 7. DNS Setup

```
Type: CNAME
Name: senlinks
Value: cname.vercel-dns.com
```
Add `senlinks.sushanka.com.np` in Vercel project settings → Domains.

---

## 8. Decisions you still need to make before this is buildable end-to-end

- Does `senlinks.sushanka.com.np` (root) show YOUR profile, or a generic landing/signup page for the multi-user product? These are different products.
- If multi-user, do you want any moderation/reporting (someone could put offensive content on a public profile under your domain)?