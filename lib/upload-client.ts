import type { ActionResult } from "@/types/api";

let counter = 0;

/** Ids for media that only exists in optimistic client state (upload
 * failed, or hasn't finished yet) are tagged with this prefix so
 * Remove/Replace/Reorder can tell "call the server" apart from "just
 * update local state" without a separate boolean flag on every item. */
const LOCAL_ID_PREFIX = "local-";

export function nextLocalId(kind: string): string {
  counter += 1;
  return `${LOCAL_ID_PREFIX}${kind}-${Date.now()}-${counter}`;
}

export function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX);
}

/**
 * Retries a Server Action call a couple of times with a short backoff
 * before giving up — the Studio's upload UI has no dedicated "retry"
 * button, so this is what "retry failed uploads" means in practice: a
 * transient failure resolves itself silently instead of requiring the
 * user to notice and re-attempt.
 */
export async function withRetry<T>(
  fn: () => Promise<ActionResult<T>>,
  retries = 2,
  delayMs = 600
): Promise<ActionResult<T>> {
  let lastResult: ActionResult<T> | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      lastResult = await fn();
    } catch {
      lastResult = { ok: false, error: "Network error. Retrying…", code: "INTERNAL_ERROR" };
    }
    if (lastResult.ok) return lastResult;
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
  }

  return lastResult as ActionResult<T>;
}
