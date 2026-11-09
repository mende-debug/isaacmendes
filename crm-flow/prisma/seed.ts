import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.SEED_USERNAME ?? "consultor").toLowerCase();
  const password = process.env.SEED_PASSWORD ?? "crmflow123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, nome: "Consultor", passwordHash },
  });
  console.log(`Usuário "${username}" pronto.`);
}

main().finally(() => prisma.$disconnect());
