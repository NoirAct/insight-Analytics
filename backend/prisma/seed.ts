import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, ProductStatus, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCES = ["Orgânico", "Google Ads", "Instagram", "Indicação", "Direto"];
const PRODUCT_DEFS = [
  { name: "Analytics Pro", price: 189, category: "Planos" },
  { name: "Insight Starter", price: 79, category: "Planos" },
  { name: "Dashboards Pack", price: 129, category: "Add-ons" },
  { name: "API Extra", price: 49, category: "Add-ons" },
  { name: "Suporte Priority", price: 99, category: "Serviços" },
  { name: "Consultoria", price: 450, category: "Serviços" },
];

const PERMISSIONS = [
  { key: "users.read", description: "Visualizar usuários" },
  { key: "users.write", description: "Gerenciar usuários" },
  { key: "products.read", description: "Visualizar produtos" },
  { key: "products.write", description: "Gerenciar produtos" },
  { key: "reports.read", description: "Visualizar relatórios" },
  { key: "settings.write", description: "Editar configurações" },
];

const ROLE_DEFS = [
  {
    name: "Admin",
    description: "Acesso total à plataforma",
    permissions: PERMISSIONS.map((item) => item.key),
  },
  {
    name: "Manager",
    description: "Gestão operacional",
    permissions: [
      "users.read",
      "users.write",
      "products.read",
      "products.write",
      "reports.read",
    ],
  },
  {
    name: "Analyst",
    description: "Análise e leitura",
    permissions: ["users.read", "products.read", "reports.read"],
  },
  {
    name: "Viewer",
    description: "Somente visualização",
    permissions: ["users.read", "products.read", "reports.read"],
  },
];

function daysAgo(n: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - n);
  return date;
}

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.companySettings.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  const permissions = await Promise.all(
    PERMISSIONS.map((item) =>
      prisma.permission.create({
        data: item,
      }),
    ),
  );
  const permissionByKey = new Map(permissions.map((item) => [item.key, item.id]));

  const roles = [];
  for (const roleDef of ROLE_DEFS) {
    const role = await prisma.role.create({
      data: {
        name: roleDef.name,
        description: roleDef.description,
        permissions: {
          connect: roleDef.permissions.map((key) => ({
            id: permissionByKey.get(key)!,
          })),
        },
      },
    });
    roles.push(role);
  }

  const roleByName = new Map(roles.map((item) => [item.name, item.id]));
  const passwordHash = await bcrypt.hash("novaSenha1", 12);

  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@insight.dev",
      passwordHash,
      status: "ACTIVE",
      theme: "dark",
      locale: "pt-BR",
      roleId: roleByName.get("Admin"),
      createdAt: daysAgo(200),
    },
  });

  const statuses: UserStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "INVITED"];
  const roleNames = ["Manager", "Analyst", "Viewer", "Analyst", "Viewer"];

  const extraUsers = await Promise.all(
    Array.from({ length: 48 }).map((_, index) =>
      prisma.user.create({
        data: {
          name: `Usuário ${index + 1}`,
          email: `user${index + 1}@insight.dev`,
          passwordHash,
          status: statuses[index % statuses.length],
          roleId: roleByName.get(roleNames[index % roleNames.length]),
          createdAt: daysAgo(Math.floor(Math.random() * 360)),
        },
      }),
    ),
  );

  const categories = await Promise.all(
    ["Planos", "Add-ons", "Serviços"].map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        },
      }),
    ),
  );

  const categoryByName = new Map(categories.map((item) => [item.name, item.id]));

  const products = await Promise.all(
    PRODUCT_DEFS.map((item) =>
      prisma.product.create({
        data: {
          name: item.name,
          description: `${item.name} para o SaaS Insight Analytics`,
          price: item.price,
          stock: 40 + Math.floor(Math.random() * 80),
          status: ProductStatus.ACTIVE,
          categoryId: categoryByName.get(item.category),
        },
      }),
    ),
  );

  for (let day = 0; day < 365; day += 1) {
    const date = daysAgo(day);
    const weekdayBoost = [0, 6].includes(date.getDay()) ? 0.7 : 1;
    const trend = 1 + (365 - day) / 900;
    const orderCount = Math.max(
      0,
      Math.round((1 + Math.random() * 4) * weekdayBoost * trend),
    );

    let dayRevenue = 0;

    for (let i = 0; i < orderCount; i += 1) {
      const itemCount = 1 + Math.floor(Math.random() * 3);
      const selected = Array.from({ length: itemCount }).map(() => {
        const product = products[Math.floor(Math.random() * products.length)]!;
        const quantity = 1 + Math.floor(Math.random() * 2);
        return {
          productId: product.id,
          quantity,
          unitPrice: Number(product.price),
          lineTotal: Number(product.price) * quantity,
        };
      });

      const total = selected.reduce((sum, item) => sum + item.lineTotal, 0);
      dayRevenue += total;

      await prisma.order.create({
        data: {
          customerName: `Cliente ${day}-${i}`,
          total,
          status: "completed",
          source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
          createdAt: date,
          updatedAt: date,
          items: {
            create: selected.map(({ productId, quantity, unitPrice }) => ({
              productId,
              quantity,
              unitPrice,
            })),
          },
        },
      });
    }

    if (dayRevenue > 0) {
      await prisma.revenue.create({
        data: {
          amount: Number(dayRevenue.toFixed(2)),
          date,
          source: "orders",
        },
      });
    }
  }

  await prisma.companySettings.create({
    data: {
      name: "Insight Analytics",
    },
  });

  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      title: "Bem-vindo",
      body: "Dashboard com dados de demonstração pronto.",
    },
  });

  console.log(
    `Seed ok: demo=${demoUser.email} + ${extraUsers.length} usuários + ${roles.length} cargos`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
