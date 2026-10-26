"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoForm } from "@/lib/actions/auth";
import { Logo } from "./Logo";

export function FormAuth({
  modo,
  acao,
  permiteCadastro,
}: {
  modo: "login" | "cadastro";
  acao: (estado: EstadoForm, form: FormData) => Promise<EstadoForm>;
  permiteCadastro: boolean;
}) {
  const [estado, enviar, pendente] = useActionState(acao, undefined);
  const login = modo === "login";
  return (
    <div className="card p-6 shadow-2xl shadow-black/50">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Logo />
        <p className="text-sm text-muted">{login ? "Entre para simular fluxos de pagamento" : "Crie seu acesso de consultor"}</p>
      </div>
      <form action={enviar} className="space-y-4">
        {!login && (
          <div>
            <label className="label" htmlFor="nome">Seu nome</label>
            <input id="nome" name="nome" className="field" autoComplete="name" required />
          </div>
        )}
        <div>
          <label className="label" htmlFor="username">Usuário</label>
          <input id="username" name="username" className="field" autoComplete="username" autoCapitalize="none" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            className="field"
            autoComplete={login ? "current-password" : "new-password"}
            required
          />
        </div>
        {estado?.erro && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{estado.erro}</p>}
        <button className="btn-primary w-full py-3" disabled={pendente}>
          {pendente ? "Aguarde…" : login ? "Entrar" : "Criar conta"}
        </button>
      </form>
      {permiteCadastro && (
        <p className="mt-5 text-center text-sm text-muted">
          {login ? (
            <>Não tem conta? <Link className="font-semibold text-brand-soft" href="/cadastro">Cadastre-se</Link></>
          ) : (
            <>Já tem conta? <Link className="font-semibold text-brand-soft" href="/login">Entrar</Link></>
          )}
        </p>
      )}
    </div>
  );
}
