type P = { className?: string };
const base = (d: React.ReactNode, className = "size-5") => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {d}
  </svg>
);
export const IconePlus = ({ className }: P) => base(<path d="M12 5v14M5 12h14" />, className);
export const IconeCopiar = ({ className }: P) => base(<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>, className);
export const IconeLixo = ({ className }: P) => base(<><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>, className);
export const IconeDoc = ({ className }: P) => base(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>, className);
export const IconeColunas = ({ className }: P) => base(<><rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="16" rx="1" /><rect x="17" y="4" width="4" height="16" rx="1" /></>, className);
export const IconeVoltar = ({ className }: P) => base(<path d="M15 18l-6-6 6-6" />, className);
export const IconeAvancar = ({ className }: P) => base(<path d="M9 18l6-6-6-6" />, className);
export const IconeSair = ({ className }: P) => base(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>, className);
export const IconeSalvar = ({ className }: P) => base(<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>, className);
export const IconeBusca = ({ className }: P) => base(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>, className);
export const IconeUsuarios = ({ className }: P) => base(<><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 3.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-5-6.7" /></>, className);
export const IconeLista = ({ className }: P) => base(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />, className);
export const IconeCheck = ({ className }: P) => base(<path d="M20 6L9 17l-5-5" />, className);
export const IconeAlerta = ({ className }: P) => base(<><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>, className);
export const IconeWhats = ({ className }: P) => base(<><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z" /><path d="M9 10a1 1 0 0 0 1 1 5 5 0 0 0 3 3 1 1 0 0 0 1 1l1-1 2 1-.5 1.5a2 2 0 0 1-2 1A7 7 0 0 1 8 11a2 2 0 0 1 1-2l1.5-.5 1 2z" /></>, className);
