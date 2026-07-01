import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
      experience?: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as { role?: string | null; experience?: string | null };
        token.role = u.role ?? null;
        token.experience = u.experience ?? null;
      } else if (token.id) {
        // Query the database to ensure the token has the latest onboarding state
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, experience: true },
        });
        if (dbUser) {
          token.role = dbUser.role ?? null;
          token.experience = dbUser.experience ?? null;
        }
      }
      return token;
    },
  },
});

export async function getCurrentUser(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
