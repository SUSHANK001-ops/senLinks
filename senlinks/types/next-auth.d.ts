import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      usernameSet?: boolean;
      oauthAvatarUrl?: string | null;
    };
  }

  interface User {
    username?: string;
    usernameSet?: boolean;
    oauthAvatarUrl?: string | null;
  }
}
