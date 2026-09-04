import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();
const DEMO_EMAIL = "demo@insight.dev";
const DEMO_PASSWORD = "DemoInsight2026!";

const permissions = [
  ["users.read", "Visualizar usuários"], ["users.write", "Gerenciar usuários"],
  ["products.read", "Visualizar produtos"], ["products.write", "Gerenciar produtos"],
  ["reports.read", "Visualizar relatórios"], ["settings.write", "Editar configurações"],
] as const;
const products = [
  ["Analytics Pro", 189, "Planos"], ["Insight Starter", 79, "Planos"],
  ["Dashboards Pack", 129, "Add-ons"], ["API Extra", 49, "Add-ons"],
  ["Suporte Priority", 99, "Serviços"], ["Consultoria", 450, "Serviços"],
] as const;

async function main() {
  for (const [key, description] of permissions) {
    await prisma.permission.upsert({ where: { key }, update: { description }, create: { key, description } });
  }
  const allPermissions = await prisma.permission.findMany();
  const admin = await prisma.role.upsert({
    where: { name: "Admin" },
    update: { permissions: { set: allPermissions.map(({ id }) => ({ id })) } },
    create: { name: "Admin", description: "Acesso total à plataforma", permissions: { connect: allPermissions.map(({ id }) => ({ id })) } },
  });
  for (const name of ["Manager", "Analyst", "Viewer"]) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const demo = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo User", passwordHash, status: "ACTIVE", roleId: admin.id },
    create: { name: "Demo User", email: DEMO_EMAIL, passwordHash, status: "ACTIVE", roleId: admin.id },
  });

  for (const name of ["Planos", "Add-ons", "Serviços"]) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") } });
  }
  const categories = new Map((await prisma.category.findMany()).map((item) => [item.name, item.id]));
  for (const [name, price, category] of products) {
    const existing = await prisma.product.findFirst({ where: { name } });
    const data = { name, price, stock: 75, status: ProductStatus.ACTIVE, categoryId: categories.get(category) };
    if (existing) await prisma.product.update({ where: { id: existing.id }, data });
    else await prisma.product.create({ data });
  }

  if (await prisma.revenue.count({ where: { source: "demo-seed" } }) === 0) {
    await prisma.revenue.createMany({ data: Array.from({ length: 90 }, (_, index) => ({
      amount: 900 + ((index * 137) % 1700), date: new Date(Date.UTC(2026, 5, 1 + index)), source: "demo-seed",
    })) });
  }
  await prisma.companySettings.upsert({ where: { id: "demo-company" }, update: { name: "Insight Analytics" }, create: { id: "demo-company", name: "Insight Analytics" } });
  if (await prisma.notification.count({ where: { userId: demo.id, title: "Bem-vindo à demonstração" } }) === 0) {
    await prisma.notification.create({ data: { userId: demo.id, title: "Bem-vindo à demonstração", body: "Explore os indicadores em modo somente leitura." } });
  }
  console.log(`Seed ready. Demo account: ${DEMO_EMAIL}`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
