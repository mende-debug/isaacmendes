import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLICAS = ["/login", "/cadastro", "/offline"];

/** Redireciona para /login quem não tem sessão válida. A checagem definitiva é feita no servidor (lib/session.ts). */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLICAS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get("logan_session")?.value;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-nao-use-em-producao");
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // token inválido/expirado: segue para o login
    }
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icons/|manifest.webmanifest|sw.js|favicon.ico|offline).*)"],
};
