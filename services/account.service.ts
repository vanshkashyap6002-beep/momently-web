import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authTokenRepository } from "@/repositories/auth-token.repository";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { ValidationError, RateLimitError } from "@/lib/errors";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function newToken(): string {
  return randomBytes(32).toString("hex");
}

const appUrl = () => process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const accountService = {
  /**
   * Always resolves the same way whether or not the email exists — never
   * reveal to a caller "this email isn't registered," which would let
   * someone enumerate real accounts.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const normalized = email.toLowerCase().trim();

    const limit = await checkRateLimit(`password-reset:${normalized}`, 3, 15 * 60);
    if (!limit.allowed) {
      throw new RateLimitError("Too many reset requests. Please wait a few minutes and try again.");
    }

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user?.password) return; // silently no-op: no account, or OAuth-only account

    await authTokenRepository.invalidateAllForUser(user.id, "PASSWORD_RESET");
    const token = newToken();
    await authTokenRepository.create(user.id, "PASSWORD_RESET", token, new Date(Date.now() + RESET_TOKEN_TTL_MS));

    await sendEmail({
      to: user.email,
      subject: "Reset your Momently password",
      text: `Reset your password: ${appUrl()}/reset-password?token=${token}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await authTokenRepository.findValidByToken(token, "PASSWORD_RESET");
    if (!record) {
      throw new ValidationError("This reset link is invalid or has expired. Please request a new one.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: record.userId }, data: { password: passwordHash } });
    await authTokenRepository.markUsed(record.id);
  },

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    await authTokenRepository.invalidateAllForUser(userId, "EMAIL_VERIFY");
    const token = newToken();
    await authTokenRepository.create(userId, "EMAIL_VERIFY", token, new Date(Date.now() + VERIFY_TOKEN_TTL_MS));

    await sendEmail({
      to: email,
      subject: "Verify your Momently email",
      text: `Verify your email: ${appUrl()}/verify-email?token=${token}\n\nThis link expires in 24 hours.`,
    });
  },

  async verifyEmail(token: string): Promise<void> {
    const record = await authTokenRepository.findValidByToken(token, "EMAIL_VERIFY");
    if (!record) {
      throw new ValidationError("This verification link is invalid or has expired.");
    }

    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } });
    await authTokenRepository.markUsed(record.id);
  },
};
