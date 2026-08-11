/**
 * Automated pre-screen run on every template submission, before it enters
 * the admin review queue.
 *
 * Honest about its scope: this app's Template model has no field where a
 * creator's markup/code is ever rendered as HTML (title/category/
 * description are plain text, always rendered through React's default
 * escaping — never `dangerouslySetInnerHTML`), so classic stored-XSS via
 * these fields is already structurally prevented by the framework, not by
 * this scanner. What this scanner actually catches:
 *   - non-https / non-image URLs in thumbnail/previewImages (blocks
 *     `javascript:`, `data:`, and similar malicious URL schemes outright)
 *   - suspicious markup/script patterns in text fields, as defense in depth
 *   - IP-address URLs and known link-shortener domains (common malicious-
 *     link/scam patterns)
 *   - excessively long text fields (spam signal)
 *   - missing preview imagery (basic completeness, a weak proxy for
 *     "broken layout" — not a real layout check, which would need actual
 *     rendering)
 *
 * It deliberately does NOT claim to detect copyright infringement — that
 * needs real content matching (reverse image search, etc.) this app has no
 * provider for. Every flag here is a hint for the human admin, never an
 * auto-reject — matching the brief's own "flag suspicious submissions,
 * let admin decide" framing.
 */

export interface ScanFlag {
  severity: "warning" | "high";
  message: string;
}

export interface ScanResult {
  flags: ScanFlag[];
  hasHighSeverityFlag: boolean;
}

const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const SUSPICIOUS_TEXT_PATTERNS: RegExp[] = [
  /<script/i,
  /<iframe/i,
  /javascript:/i,
  /on(error|load|click|mouseover)\s*=/i,
  /<img[^>]+onerror/i,
];
const SHORTENER_DOMAINS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly"];
const IP_ADDRESS_HOST = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

function extensionOf(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  } catch {
    return "";
  }
}

function scanImageUrl(url: string, label: string): ScanFlag[] {
  const flags: ScanFlag[] = [];

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    flags.push({ severity: "high", message: `${label}: not a valid URL.` });
    return flags;
  }

  if (parsed.protocol !== "https:") {
    flags.push({
      severity: "high",
      message: `${label}: only https:// URLs are allowed (got "${parsed.protocol}").`,
    });
  }

  if (IP_ADDRESS_HOST.test(url)) {
    flags.push({ severity: "high", message: `${label}: points directly at an IP address, not a domain.` });
  }

  if (SHORTENER_DOMAINS.some((domain) => parsed.hostname.endsWith(domain))) {
    flags.push({ severity: "warning", message: `${label}: uses a link-shortener domain (${parsed.hostname}).` });
  }

  const extension = extensionOf(url);
  if (extension && !ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    flags.push({
      severity: "warning",
      message: `${label}: unusual file extension ".${extension}" for an image URL.`,
    });
  }

  return flags;
}

function scanText(value: string, label: string, maxLength: number): ScanFlag[] {
  const flags: ScanFlag[] = [];

  if (SUSPICIOUS_TEXT_PATTERNS.some((pattern) => pattern.test(value))) {
    flags.push({ severity: "high", message: `${label}: contains script/markup-like content.` });
  }

  if (value.length > maxLength) {
    flags.push({ severity: "warning", message: `${label}: unusually long (${value.length} characters).` });
  }

  return flags;
}

export function scanTemplateSubmission(input: {
  title: string;
  description: string;
  thumbnail: string;
  previewImages: string[];
}): ScanResult {
  const flags: ScanFlag[] = [
    ...scanText(input.title, "Title", 120),
    ...scanText(input.description, "Description", 2000),
    ...scanImageUrl(input.thumbnail, "Thumbnail"),
    ...input.previewImages.flatMap((url, i) => scanImageUrl(url, `Preview image ${i + 1}`)),
  ];

  if (input.previewImages.length === 0) {
    flags.push({ severity: "warning", message: "No preview images provided." });
  }

  return {
    flags,
    hasHighSeverityFlag: flags.some((f) => f.severity === "high"),
  };
}
