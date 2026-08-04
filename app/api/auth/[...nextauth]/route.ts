import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
