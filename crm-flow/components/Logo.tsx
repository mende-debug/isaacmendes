export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-base font-black text-white shadow-lg shadow-brand/30">F</span>
      {!compacto && (
        <span className="text-lg font-bold tracking-tight">
          CRM <span className="font-medium text-brand-soft">Flow</span>
        </span>
      )}
    </span>
  );
}
