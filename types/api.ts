/**
 * Shared response envelope for both Server Actions and Route Handlers, so
 * every entry point into the backend — form action or fetch() — returns a
 * response shaped the same way.
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "PAYMENT_REQUIRED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode; fieldErrors?: Record<string, string[]> };
