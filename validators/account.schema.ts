import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, "Verification token is required."),
});
