"use client";

export function BotaoConfirmar({
  mensagem,
  className,
  titulo,
  children,
}: {
  mensagem: string;
  className?: string;
  titulo?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={className}
      title={titulo}
      aria-label={titulo}
      onClick={(e) => {
        if (!confirm(mensagem)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
