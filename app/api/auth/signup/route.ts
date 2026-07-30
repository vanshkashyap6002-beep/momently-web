import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { accountService } from "@/services/account.service";

const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  // 5 new accounts per hour per IP — signup has no existing-user identity
  // to key on the way login does, so this keys on IP instead.
  const limit = await checkRateLimit(`signup:${getClientIp(request)}`, 5, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { fullName: name, email: normalizedEmail, password: hashedPassword },
    select: { id: true, fullName: true, email: true },
  });

  // Fire-and-forget: a failure here shouldn't block account creation —
  // the account still works, the user just stays unverified until they
  // request another link (not built yet as a UI, but the action exists).
  accountService.sendVerificationEmail(user.id, user.email).catch((err) => {
    console.error("Failed to send verification email:", err);
  });

  return NextResponse.json({ user }, { status: 201 });
}
