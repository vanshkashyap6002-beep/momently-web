import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

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

/**
 * Admin Panel gate: resolves the current user's id, but only if they're
 * signed in AND have role ADMIN. Throws `UnauthorizedError` (401) if not
 * signed in, `ForbiddenError` (403) if signed in as a plain USER. This is
 * the server-side check every admin Server Action/Route Handler calls
 * first — middleware.ts enforces the same rule at the edge, but that's
 * never sufficient on its own (frontend/edge checks are never trusted as
 * the only line of defense — this is the real one).
 */
export async function requireAdminUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError("You must be signed in to do that.");
  }
  if (session.user.role !== "ADMIN") {
    throw new ForbiddenError("Admin access required.");
  }
  return session.user.id;
}
