import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// Note: no PrismaAdapter here. The adapter expects NextAuth's own
// Account/Session/VerificationToken tables, which this schema intentionally
// doesn't include (authentication implementation is out of scope for the
// database-layer task this schema belongs to). Credentials + JWT sessions
// don't require an adapter at all — sessions live entirely in the signed
// JWT, and this authorize() function is the only place we touch Postgres.
export const authOptions: AuthOptions = {
  // Explicit and deliberate rather than NextAuth's silent 30-day default —
  // 7 days, refreshed on activity (NextAuth's default `updateAge`).
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        // 10 attempts per 5 minutes per email — blunt brute-force
        // protection. Fails closed (silently rejects) rather than
        // revealing "you're rate limited" to a potential attacker.
        const limit = await checkRateLimit(`login:${email}`, 10, 5 * 60);
        if (!limit.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.password) return null;
        // Admin Panel addition: a suspended account can no longer sign in.
        // Existing users (isSuspended defaults to false) are unaffected.
        if (user.isSuspended) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Fire-and-forget: powers the Admin Panel's "Active Users" metric.
        // Never blocks or fails the login itself.
        prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) (session.user as { id?: string }).id = token.id as string;
        if (token.role) (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
