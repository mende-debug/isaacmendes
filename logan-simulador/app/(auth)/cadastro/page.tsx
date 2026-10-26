import { redirect } from "next/navigation";
import { FormAuth } from "@/components/FormAuth";
import { cadastrar } from "@/lib/actions/auth";
import { usuarioAtual } from "@/lib/session";

export const metadata = { title: "Cadastro" };

export default async function CadastroPage() {
  if (process.env.ALLOW_SIGNUP !== "true") redirect("/login");
  if (await usuarioAtual()) redirect("/");
  return <FormAuth modo="cadastro" acao={cadastrar} permiteCadastro />;
}
