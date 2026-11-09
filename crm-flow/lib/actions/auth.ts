"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { criarSessao, encerrarSessao } from "@/lib/session";

export type EstadoForm = { erro?: string } | undefined;

const credenciais = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,32}$/, "Usuário: 3 a 32 caracteres (letras, números, . _ -)"),
  password: z.string().min(6, "Senha: mínimo de 6 caracteres").max(128),
});

export async function entrar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const dados = credenciais.safeParse({ username: form.get("username"), password: form.get("password") });
  if (!dados.success) return { erro: "Usuário ou senha inválidos" };
  const user = await prisma.user.findUnique({ where: { username: dados.data.username } });
  if (!user || !(await bcrypt.compare(dados.data.password, user.passwordHash))) {
    return { erro: "Usuário ou senha inválidos" };
  }
  await criarSessao(user.id);
  redirect("/");
}

export async function cadastrar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  if (process.env.ALLOW_SIGNUP !== "true") return { erro: "Cadastro desativado. Fale com o administrador." };
  const dados = credenciais.extend({ nome: z.string().trim().min(2, "Informe seu nome").max(80) }).safeParse({
    nome: form.get("nome"),
    username: form.get("username"),
    password: form.get("password"),
  });
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos" };
  if (await prisma.user.findUnique({ where: { username: dados.data.username } })) {
    return { erro: "Esse usuário já existe" };
  }
  const user = await prisma.user.create({
    data: { nome: dados.data.nome, username: dados.data.username, passwordHash: await bcrypt.hash(dados.data.password, 10) },
  });
  await criarSessao(user.id);
  redirect("/");
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}
