import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./db";

export const SESSION_COOKIE = "crmflow_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET não configurado");
  return new TextEncoder().encode(s ?? "dev-secret-nao-use-em-producao");
}

export async function assinarSessao(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verificarSessao(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function criarSessao(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await assinarSessao(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Usuário logado (ou null). Memoizado por requisição. */
export const usuarioAtual = cache(async () => {
  const userId = await verificarSessao((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, nome: true } });
});

export async function exigirUsuario() {
  const user = await usuarioAtual();
  if (!user) redirect("/login");
  return user;
}
