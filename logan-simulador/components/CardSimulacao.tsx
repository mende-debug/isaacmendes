import Link from "next/link";
import { duplicarSimulacao, excluirSimulacao } from "@/lib/actions/simulacoes";
import { formatarBRL } from "@/lib/fluxo";
import { BotaoConfirmar } from "./BotaoConfirmar";
import { IconeColunas, IconeCopiar, IconeDoc, IconeLixo } from "./Icones";

export type SimulacaoLista = {
  id: string;
  titulo: string;
  empreendimento: string;
  unidade: string;
  valorImovel: number;
  saldo: number;
  fechado: boolean;
  updatedAt: Date;
};

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export function CardSimulacao({ s, voltar = "/" }: { s: SimulacaoLista; voltar?: string }) {
  return (
    <li className="card group flex flex-col gap-3 p-4 transition hover:border-brand/50">
      <Link href={`/simulacoes/${s.id}`} className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{s.titulo}</p>
          <p className="truncate text-sm text-muted">
            {[s.empreendimento, s.unidade && `Unid. ${s.unidade}`].filter(Boolean).join(" · ") || "Sem empreendimento"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            s.fechado ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"
          }`}
        >
          {s.fechado ? "Fechado" : s.saldo < 0 ? `Falta ${formatarBRL(-s.saldo)}` : `Sobra ${formatarBRL(s.saldo)}`}
        </span>
      </Link>
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="tabular">
          <span className="font-semibold">{formatarBRL(s.valorImovel)}</span>
          <span className="ml-2 text-xs text-muted">{data.format(s.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1 text-muted">
          <Link href={`/simulacoes/${s.id}/proposta`} className="grid size-9 place-items-center rounded-lg hover:bg-surface-2 hover:text-fg" title="Proposta" aria-label="Proposta">
            <IconeDoc className="size-4" />
          </Link>
          <Link href={`/simulacoes/${s.id}/comparar`} className="grid size-9 place-items-center rounded-lg hover:bg-surface-2 hover:text-fg" title="Comparar cenários" aria-label="Comparar cenários">
            <IconeColunas className="size-4" />
          </Link>
          <form action={duplicarSimulacao}>
            <input type="hidden" name="id" value={s.id} />
            <button className="grid size-9 place-items-center rounded-lg hover:bg-surface-2 hover:text-fg" title="Duplicar" aria-label="Duplicar">
              <IconeCopiar className="size-4" />
            </button>
          </form>
          <form action={excluirSimulacao}>
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="voltar" value={voltar} />
            <BotaoConfirmar mensagem={`Excluir a simulação de ${s.titulo}?`} className="grid size-9 place-items-center rounded-lg hover:bg-danger/10 hover:text-danger" titulo="Excluir">
              <IconeLixo className="size-4" />
            </BotaoConfirmar>
          </form>
        </div>
      </div>
    </li>
  );
}
