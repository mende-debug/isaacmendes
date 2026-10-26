import { redirect } from "next/navigation";
import { FormAuth } from "@/components/FormAuth";
import { entrar } from "@/lib/actions/auth";
import { usuarioAtual } from "@/lib/session";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await usuarioAtual()) redirect("/");
  return <FormAuth modo="login" acao={entrar} permiteCadastro={process.env.ALLOW_SIGNUP === "true"} />;
}
