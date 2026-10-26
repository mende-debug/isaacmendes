import type { Alerta } from "@/lib/fluxo";
import { IconeAlerta, IconeCheck } from "./Icones";

const ESTILO: Record<Alerta["nivel"], string> = {
  sucesso: "border-ok/40 bg-ok/10 text-ok",
  erro: "border-danger/40 bg-danger/10 text-danger",
  aviso: "border-warn/40 bg-warn/10 text-warn",
};

export function Alertas({ alertas, className }: { alertas: Alerta[]; className?: string }) {
  return (
    <ul className={`space-y-2 ${className ?? ""}`} aria-live="polite">
      {alertas.map((a) => (
        <li key={a.codigo} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${ESTILO[a.nivel]}`}>
          {a.nivel === "sucesso" ? <IconeCheck className="mt-0.5 size-4 shrink-0" /> : <IconeAlerta className="mt-0.5 size-4 shrink-0" />}
          <span>{a.mensagem}</span>
        </li>
      ))}
    </ul>
  );
}
