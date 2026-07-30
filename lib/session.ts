import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Resolves the current user's id or throws `UnauthorizedError` (401).
 * Centralized so every Server Action and Route Handler enforces the same
 * "signed in" check the same way — this is the single placeholder-until-
 * full-auth gate the rest of the backend relies on.
 */
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError("You must be signed in to do that.");
  }
  return session.user.id;
}
