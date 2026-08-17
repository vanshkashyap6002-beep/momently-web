import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const FORBIDDEN_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>403 — Forbidden</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FDFBF9;font-family:system-ui,-apple-system,sans-serif;">
  <div style="text-align:center;padding:2rem;">
    <p style="font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;color:#7A1E2B;margin:0 0 0.75rem;">Admin Panel</p>
    <h1 style="font-size:1.75rem;color:#12100F;margin:0 0 0.5rem;">403 — Forbidden</h1>
    <p style="color:#12100F99;margin:0;">You don't have permission to access this page.</p>
  </div>
</body>
</html>`;

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin-panel")) {
      const token = req.nextauth.token;
      if (token?.role !== "ADMIN") {
        return new NextResponse(FORBIDDEN_HTML, {
          status: 403,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: ["/customize/:path*", "/checkout/:path*", "/admin-panel/:path*", "/account/:path*"],
};
