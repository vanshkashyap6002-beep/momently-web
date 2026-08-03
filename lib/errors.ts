import type { ErrorCode } from "@/types/api";

/**
 * Base class for every expected, "handled" error in the service layer.
 * Route handlers and Server Actions both catch `AppError` and translate it
 * into their respective response shapes (NextResponse / ActionResult) —
 * the status code and machine-readable code live on the error itself so
 * that translation is a pure, dumb mapping in one place.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, code: ErrorCode, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** 400 — request body/query failed Zod validation. */
export class ValidationError extends AppError {
  constructor(message = "Please check the highlighted fields.", fieldErrors?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR", fieldErrors);
  }
}

/** 404 — resource doesn't exist, OR exists but isn't owned by the caller.
 * Deliberately reused for both cases (rather than adding a 403) so an
 * unauthorized lookup can't be used to probe for the existence of other
 * users' projects. */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(message, 404, "NOT_FOUND");
  }
}

/** 401 — placeholder until a full auth system exists; today this fires
 * whenever `getServerSession()` returns no user. */
export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in to do that.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/** 403 — signed in, but lacking the required role (Admin Panel only).
 * Unlike NotFoundError's deliberate 404-for-both approach on ownership
 * checks, there's nothing to hide here — the Admin Panel's existence
 * itself isn't a secret worth protecting via ambiguity, only its data is. */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do that.") {
    super(message, 403, "FORBIDDEN");
  }
}

/** 402 — the project's template is premium and has no successful Payment
 * yet; publishing is blocked until checkout completes. */
export class PaymentRequiredError extends AppError {
  constructor(message = "Payment is required before publishing this project.") {
    super(message, 402, "PAYMENT_REQUIRED");
  }
}

/** 429 — too many attempts in a short window (login, signup, payment
 * order creation). A blunt but real defense against brute-force/spam. */
export class RateLimitError extends AppError {
  constructor(message = "Too many attempts. Please wait a moment and try again.") {
    super(message, 429, "RATE_LIMITED");
  }
}
