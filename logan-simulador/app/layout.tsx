import type { Metadata, Viewport } from "next";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Logan Simulador", template: "%s · Logan Simulador" },
  description: "Simulador de fluxo de pagamento para imóveis na planta (Caixa / MCMV / SBPE)",
  applicationName: "Logan Simulador",
  appleWebApp: { capable: true, title: "Logan", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/favicon-48.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#09090c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
