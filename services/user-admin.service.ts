import { userRepository, type UserSummary } from "@/repositories/user.repository";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { Role } from "@prisma/client";

export interface UserWithStats extends UserSummary {
  projectCount: number;
  paymentCount: number;
  amountSpent: number;
}

export const userAdminService = {
  async getAllUsers(): Promise<UserWithStats[]> {
    const users = await userRepository.findManyForAdmin();
    return Promise.all(
      users.map(async (user) => ({
        ...user,
        ...(await userRepository.getStatsByUserId(user.id)),
      }))
    );
  },

  async getUserById(id: string): Promise<UserWithStats> {
    const user = await userRepository.findByIdForAdmin(id);
    if (!user) throw new NotFoundError("User not found.");
    const stats = await userRepository.getStatsByUserId(id);
    return { ...user, ...stats };
  },

  /** Only ever called from an action already gated by requireAdminUserId,
   * so "can a USER promote themselves to ADMIN" is structurally impossible
   * — they never reach this code path. This function additionally blocks
   * an admin from changing their OWN role, to prevent accidental self-lockout. */
  async changeRole(actingAdminId: string, targetUserId: string, role: Role): Promise<UserSummary> {
    if (actingAdminId === targetUserId) {
      throw new ValidationError("You can't change your own role from the Admin Panel.");
    }
    const existing = await userRepository.findByIdForAdmin(targetUserId);
    if (!existing) throw new NotFoundError("User not found.");
    return userRepository.updateRole(targetUserId, role);
  },

  async setSuspended(actingAdminId: string, targetUserId: string, isSuspended: boolean): Promise<UserSummary> {
    if (actingAdminId === targetUserId) {
      throw new ValidationError("You can't suspend your own account.");
    }
    const existing = await userRepository.findByIdForAdmin(targetUserId);
    if (!existing) throw new NotFoundError("User not found.");
    return userRepository.setSuspended(targetUserId, isSuspended);
  },

  async deleteUser(actingAdminId: string, targetUserId: string): Promise<void> {
    if (actingAdminId === targetUserId) {
      throw new ValidationError("You can't delete your own account.");
    }
    const existing = await userRepository.findByIdForAdmin(targetUserId);
    if (!existing) throw new NotFoundError("User not found.");
    await userRepository.delete(targetUserId);
  },
};
