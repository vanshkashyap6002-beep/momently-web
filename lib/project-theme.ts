import type { StudioTheme } from "@/types/studio";
import { colorSchemeMap } from "@/utils/theme-map";
import { defaultTheme } from "@/utils/studio-dummy-data";

/**
 * Project.theme/font/primaryColor/secondaryColor are plain scalar columns
 * (per the database-layer spec) — but the Studio's theme has more
 * sub-choices (buttonStyle, animationStyle, background) than those four
 * columns can hold individually. Rather than adding columns outside the
 * spec, `theme` stores the full StudioTheme as JSON (the authoritative,
 * round-trippable source), while `font`/`primaryColor`/`secondaryColor` are
 * kept in sync as flattened, independently-queryable duplicates — useful
 * for e.g. "find all projects using this font" without parsing JSON.
 */
export function encodeProjectTheme(theme: StudioTheme) {
  const colors = colorSchemeMap[theme.colorScheme];
  return {
    theme: JSON.stringify(theme),
    font: theme.font,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
  };
}

export function decodeProjectTheme(themeJson: string): StudioTheme {
  try {
    const parsed = JSON.parse(themeJson);
    if (parsed && typeof parsed === "object" && "colorScheme" in parsed) {
      return parsed as StudioTheme;
    }
  } catch {
    // Fall through to defaults below — e.g. legacy rows created before this
    // encoding existed, or manually-edited data.
  }
  return defaultTheme();
}
