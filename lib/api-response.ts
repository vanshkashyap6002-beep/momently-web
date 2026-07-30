import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

/**
 * Runs a Server Action's body, catching `AppError` (expected, typed
 * failures) and translating it into the shared `ActionResult` envelope.
 * Anything else is an unexpected 500 — logged server-side, never leaked to
 * the client as a raw stack trace/message.
 */
export async function toActionResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    if (err instanceof AppError) {
      return { ok: false, error: err.message, code: err.code, fieldErrors: err.fieldErrors };
    }
    console.error(err);
    return { ok: false, error: "Something went wrong. Please try again.", code: "INTERNAL_ERROR" };
  }
}

/** Same translation, for Route Handlers — returns a NextResponse with the
 * matching HTTP status instead of an in-band `ok` flag. */
export async function toRouteResponse<T>(fn: () => Promise<T>, successStatus = 200): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json({ ok: true, data }, { status: successStatus });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { ok: false, error: err.message, code: err.code, fieldErrors: err.fieldErrors },
        { status: err.statusCode }
      );
    }
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Internal server error.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
