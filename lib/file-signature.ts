/**
 * Verifies an uploaded file's REAL content against its claimed type, using
 * the first few bytes of the file ("magic numbers") — independent of
 * whatever filename extension or browser-supplied Content-Type the
 * uploader sent, both of which are trivially spoofable and, before this
 * fix, were the ONLY checks performed (see validators/media.schema.ts and
 * services/media.service.ts). Audit finding H1.
 *
 * Deliberately scoped to exactly the formats UPLOAD_CONSTRAINTS allows
 * (validators/media.schema.ts) rather than being a general-purpose
 * file-type library — Momently only ever needs to answer "is this really
 * one of the image/video/audio formats we accept," not "what is this file."
 */

export interface DetectedFile {
  /** A representative extension for the detected format (e.g. "jpg" for
   * any JPEG regardless of whether it was uploaded as .jpg or .jpeg). */
  extension: string;
  mimeType: string;
}

function asciiAt(buffer: Buffer, start: number, end: number): string {
  return buffer.length >= end ? buffer.toString("ascii", start, end) : "";
}

function matchesRiff(buffer: Buffer, formatTag: string): boolean {
  return buffer.length >= 12 && asciiAt(buffer, 0, 4) === "RIFF" && asciiAt(buffer, 8, 12) === formatTag;
}

// ISO Base Media File Format (MP4) and QuickTime (MOV) share the same
// atom-based container structure. Modern files of both kinds almost always
// lead with an "ftyp" atom at byte offset 4; some QuickTime files instead
// lead directly with one of these other top-level atoms. Both extensions
// map to the same "VIDEO" upload kind in UPLOAD_CONSTRAINTS, so there's no
// need to tell them apart here.
const QUICKTIME_OR_MP4_ATOMS = ["ftyp", "moov", "free", "mdat", "wide", "skip", "pnot"];

/** Identifies a file's real format from its first bytes, or returns null
 * if it doesn't match any format this app accepts. */
export function detectFileSignature(buffer: Buffer): DetectedFile | null {
  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { extension: "png", mimeType: "image/png" };
  }

  // WEBP: "RIFF"...."WEBP"
  if (matchesRiff(buffer, "WEBP")) {
    return { extension: "webp", mimeType: "image/webp" };
  }

  // WAV: "RIFF"...."WAVE"
  if (matchesRiff(buffer, "WAVE")) {
    return { extension: "wav", mimeType: "audio/wav" };
  }

  // MP4 / MOV
  if (QUICKTIME_OR_MP4_ATOMS.includes(asciiAt(buffer, 4, 8))) {
    return { extension: "mp4", mimeType: "video/mp4" };
  }

  // WEBM (Matroska/EBML): 1A 45 DF A3
  if (buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { extension: "webm", mimeType: "video/webm" };
  }

  // MP3, ID3v2-tagged: starts with "ID3"
  if (asciiAt(buffer, 0, 3) === "ID3") {
    return { extension: "mp3", mimeType: "audio/mpeg" };
  }

  // MP3, untagged: raw MPEG audio frame sync (11 set bits: FF Ex/Fx/...)
  if (buffer.length >= 2 && buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return { extension: "mp3", mimeType: "audio/mpeg" };
  }

  return null;
}

/** Extensions this app treats as interchangeable for the same detected
 * format — e.g. a real JPEG may legitimately be named .jpg or .jpeg; a
 * detected MP4-family container may legitimately be named .mp4 or .mov. */
const EXTENSION_ALIASES: Record<string, string[]> = {
  jpg: ["jpg", "jpeg"],
  mp4: ["mp4", "mov"],
};

/**
 * Confirms a file's real bytes match one of the given allowed extensions
 * (from UPLOAD_CONSTRAINTS). Returns the detected format on success, or
 * null if the content doesn't genuinely match any allowed format —
 * regardless of what extension or Content-Type the upload claimed.
 */
export function verifyFileSignature(
  buffer: Buffer,
  allowedExtensions: readonly string[]
): DetectedFile | null {
  const detected = detectFileSignature(buffer);
  if (!detected) return null;

  const acceptableExtensions = EXTENSION_ALIASES[detected.extension] ?? [detected.extension];
  const isAllowed = acceptableExtensions.some((ext) => allowedExtensions.includes(ext));
  return isAllowed ? detected : null;
}
