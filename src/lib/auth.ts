import "server-only";

import bcrypt from "bcryptjs";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

import { type AppRole } from "@/config/role-access";
import { prisma } from "@/lib/prisma";

export type AuthSessionUser = DefaultSession["user"] & {
  id: string;
  role: AppRole;
  status: "ACTIVE" | "PENDING" | "REJECTED" | "INACTIVE";
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            status: true,
            avatarUrl: true,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.status) {
        return false;
      }

      if (user.status !== "ACTIVE") {
        return `/login?error=${user.status}`;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.picture = user.image ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AppRole;
        session.user.status = token.status as AuthSessionUser["status"];
        session.user.image = (token.picture as string | null | undefined) ?? null;
      }

      return session;
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();

  return (session?.user as AuthSessionUser | undefined) ?? null;
}

export async function requireCurrentUser(allowedRoles?: AppRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("INACTIVE");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
