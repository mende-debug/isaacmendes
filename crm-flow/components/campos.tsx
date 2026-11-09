"use client";

import { useId, useState } from "react";
import { formatarNumero, parseNumeroBR, type Num } from "@/lib/fluxo";

type Base = {
  label: string;
  obrigatorio?: boolean;
  ajuda?: React.ReactNode;
  className?: string;
};

function Rotulo({ id, label, obrigatorio }: { id: string; label: string; obrigatorio?: boolean }) {
  return (
    <label htmlFor={id} className="label">
      {label}
      {obrigatorio && (
        <span className="ml-0.5 text-brand-soft" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

function classeVazio(obrigatorio: boolean | undefined, vazio: boolean) {
  return obrigatorio && vazio ? "border-warn/50" : "";
}

/**
 * Campo de dinheiro com máscara de centavos: digitar "123456" mostra "1.234,56".
 * Funciona bem no teclado numérico do celular.
 */
export function CampoMoeda({ label, obrigatorio, ajuda, className, value, onChange }: Base & { value: Num; onChange: (v: Num) => void }) {
  const id = useId();
  return (
    <div className={className}>
      <Rotulo id={id} label={label} obrigatorio={obrigatorio} />
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">R$</span>
        <input
          id={id}
          className={`field tabular pl-10 text-right ${classeVazio(obrigatorio, value === null)}`}
          inputMode="numeric"
          enterKeyHint="next"
          autoComplete="off"
          placeholder="0,00"
          value={value === null ? "" : formatarNumero(value, 2)}
          onChange={(e) => {
            const digitos = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 13);
            onChange(digitos ? Number(digitos) / 100 : null);
          }}
        />
      </div>
      {ajuda && <p className="mt-1 text-xs text-muted">{ajuda}</p>}
    </div>
  );
}

/** Percentual: o estado guarda a fração (0,3) e o campo mostra "30,0". */
export function CampoPercentual({
  label,
  obrigatorio,
  ajuda,
  className,
  value,
  onChange,
  casas = 1,
}: Base & { value: Num; onChange: (v: Num) => void; casas?: number }) {
  const id = useId();
  const formatar = (v: Num) => (v === null ? "" : formatarNumero(v * 100, casas));
  const [texto, setTexto] = useState(formatar(value));
  const [focado, setFocado] = useState(false);
  const exibido = focado ? texto : formatar(value);
  return (
    <div className={className}>
      <Rotulo id={id} label={label} obrigatorio={obrigatorio} />
      <div className="relative">
        <input
          id={id}
          className={`field tabular pr-9 text-right ${classeVazio(obrigatorio, value === null)}`}
          inputMode="decimal"
          enterKeyHint="next"
          autoComplete="off"
          placeholder="0,0"
          value={exibido}
          onFocus={() => {
            setTexto(formatar(value));
            setFocado(true);
          }}
          onBlur={() => setFocado(false)}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d,.]/g, "");
            setTexto(t);
            const v = parseNumeroBR(t.replace(".", ","));
            onChange(v === null ? null : v / 100);
          }}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted">%</span>
      </div>
      {ajuda && <p className="mt-1 text-xs text-muted">{ajuda}</p>}
    </div>
  );
}

export function CampoInteiro({
  label,
  obrigatorio,
  ajuda,
  className,
  value,
  onChange,
  sufixo,
  placeholder = "0",
}: Base & { value: Num; onChange: (v: Num) => void; sufixo?: string; placeholder?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <Rotulo id={id} label={label} obrigatorio={obrigatorio} />
      <div className="relative">
        <input
          id={id}
          className={`field tabular text-right ${sufixo ? "pr-[4.5rem]" : ""} ${classeVazio(obrigatorio, value === null)}`}
          inputMode="numeric"
          enterKeyHint="next"
          autoComplete="off"
          placeholder={placeholder}
          value={value === null ? "" : String(value)}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 4);
            onChange(d ? Number(d) : null);
          }}
        />
        {sufixo && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted">{sufixo}</span>}
      </div>
      {ajuda && <p className="mt-1 text-xs text-muted">{ajuda}</p>}
    </div>
  );
}

export function CampoTexto({
  label,
  obrigatorio,
  ajuda,
  className,
  value,
  onChange,
  ...rest
}: Base & { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useId();
  return (
    <div className={className}>
      <Rotulo id={id} label={label} obrigatorio={obrigatorio} />
      <input
        id={id}
        className={`field ${classeVazio(obrigatorio, !value.trim())}`}
        enterKeyHint="next"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      {ajuda && <p className="mt-1 text-xs text-muted">{ajuda}</p>}
    </div>
  );
}

export function Segmentado<T extends string>({
  label,
  opcoes,
  value,
  onChange,
  className,
}: {
  label: string;
  opcoes: { valor: T; rotulo: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line bg-surface-2 p-1">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={value === o.valor}
            onClick={() => onChange(o.valor)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              value === o.valor ? "bg-brand text-white shadow" : "text-muted hover:text-fg"
            }`}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Interruptor({ label, checked, onChange, ajuda }: { label: string; checked: boolean; onChange: (v: boolean) => void; ajuda?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </button>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {ajuda && <span className="block text-xs text-muted">{ajuda}</span>}
      </span>
    </label>
  );
}

/** Valor calculado (somente leitura). */
export function Calculado({ label, valor, destaque, className }: { label: string; valor: string; destaque?: boolean; className?: string }) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      <div
        className={`tabular rounded-xl border px-3 py-2.5 text-right text-base font-semibold ${
          destaque ? "border-brand/40 bg-brand/10 text-brand-soft" : "border-line/60 bg-bg text-fg"
        }`}
      >
        {valor}
      </div>
    </div>
  );
}

export function Secao({ titulo, numero, children, className, acao }: { titulo: string; numero?: number; children: React.ReactNode; className?: string; acao?: React.ReactNode }) {
  return (
    <section className={`card p-4 sm:p-5 ${className ?? ""}`}>
      <header className="mb-4 flex items-center gap-2">
        {numero !== undefined && (
          <span className="grid size-6 place-items-center rounded-md bg-brand/15 text-xs font-bold text-brand-soft">{numero}</span>
        )}
        <h2 className="text-sm font-bold tracking-wide uppercase">{titulo}</h2>
        {acao && <div className="ml-auto">{acao}</div>}
      </header>
      {children}
    </section>
  );
}
