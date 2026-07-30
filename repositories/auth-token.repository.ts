import { prisma } from "@/lib/prisma";
import type { AuthToken, TokenPurpose } from "@prisma/client";

export const authTokenRepository = {
  create(userId: string, purpose: TokenPurpose, token: string, expiresAt: Date): Promise<AuthToken> {
    return prisma.authToken.create({ data: { userId, purpose, token, expiresAt } });
  },

  findValidByToken(token: string, purpose: TokenPurpose): Promise<AuthToken | null> {
    return prisma.authToken.findFirst({
      where: { token, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  markUsed(id: string): Promise<AuthToken> {
    return prisma.authToken.update({ where: { id }, data: { usedAt: new Date() } });
  },

  invalidateAllForUser(userId: string, purpose: TokenPurpose): Promise<{ count: number }> {
    return prisma.authToken.updateMany({
      where: { userId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });
  },
};
