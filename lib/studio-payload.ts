import type { StudioState } from "@/types/studio";

/**
 * Shapes the Studio's full editable state down to exactly what
 * `saveDraft`/`publishProject` persist (project id, title, cover image,
 * theme) — kept alongside the Studio rather than in the server-only
 * service layer since it's pure client-side data shaping, not business
 * logic. Media is intentionally excluded: each photo/video/music
 * upload/replace/delete/reorder already persists immediately through its
 * own action (see `media.actions.ts`), so it never needs to be re-sent
 * here. See `lib/project-mapper.ts` for the inverse (DB -> Studio state).
 */
export function toSaveProjectPayload(state: StudioState) {
  return {
    projectId: state.projectId,
    title: state.messages.title,
    coverImage: state.photos[0]?.url ?? null,
    theme: state.theme,
  };
}
