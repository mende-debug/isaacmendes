"use client";

import { useState } from "react";
import { formatarBRL, type TabelaAmortizacao as Tabela } from "@/lib/fluxo";

export function TabelaAmortizacao({ tabela }: { tabela: Tabela }) {
  const [todas, setTodas] = useState(false);
  const linhas = todas ? tabela.linhas : tabela.linhas.slice(0, 12);
  return (
    <div>
      <div className="max-h-96 overflow-auto rounded-xl border border-line">
        <table className="tabular w-full text-right text-xs sm:text-sm">
          <thead className="sticky top-0 bg-surface-2 text-muted">
            <tr>
              <th className="px-2 py-2 text-left font-medium">Mês</th>
              <th className="px-2 py-2 font-medium">Prestação</th>
              <th className="px-2 py-2 font-medium">Juros</th>
              <th className="px-2 py-2 font-medium">Amortização</th>
              <th className="px-2 py-2 font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {linhas.map((l) => (
              <tr key={l.mes}>
                <td className="px-2 py-1.5 text-left text-muted">{l.mes}</td>
                <td className="px-2 py-1.5 font-semibold">{formatarBRL(l.prestacao)}</td>
                <td className="px-2 py-1.5">{formatarBRL(l.juros)}</td>
                <td className="px-2 py-1.5">{formatarBRL(l.amortizacao)}</td>
                <td className="px-2 py-1.5 text-muted">{formatarBRL(l.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tabela.linhas.length > 12 && (
        <button type="button" className="mt-2 text-sm font-semibold text-brand-soft" onClick={() => setTodas(!todas)}>
          {todas ? "Mostrar só os 12 primeiros meses" : `Mostrar os ${tabela.linhas.length} meses`}
        </button>
      )}
    </div>
  );
}
