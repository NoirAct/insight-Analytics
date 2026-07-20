import { prisma } from "../database/prisma.js";
import { AppError } from "../middlewares/error-handler.js";
import type { DashboardPeriodInput } from "../validators/dashboard.validators.js";
import {
  chooseGranularity,
  formatBucketKey,
  percentChange,
  resolvePeriod,
  toNumber,
} from "../utils/period.js";

function buildBuckets(start: Date, end: Date, granularity: "day" | "month") {
  const keys: string[] = [];
  const cursor = new Date(start);

  if (granularity === "month") {
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    const limit = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= limit) {
      keys.push(formatBucketKey(cursor, "month"));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys;
  }

  cursor.setHours(0, 0, 0, 0);
  const limit = new Date(end);
  limit.setHours(0, 0, 0, 0);
  while (cursor <= limit) {
    keys.push(formatBucketKey(cursor, "day"));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

async function sumOrders(start: Date, end: Date) {
  const result = await prisma.order.aggregate({
    where: {
      createdAt: { gte: start, lte: end },
      status: "completed",
    },
    _sum: { total: true },
    _count: { _all: true },
    _avg: { total: true },
  });

  return {
    revenue: toNumber(result._sum.total),
    orders: result._count._all,
    avgTicket: toNumber(result._avg.total),
  };
}

async function countUsers(start: Date, end: Date) {
  return prisma.user.count({
    where: { createdAt: { gte: start, lte: end } },
  });
}

export const dashboardService = {
  async getOverview(input: DashboardPeriodInput) {
    let period;
    try {
      period = resolvePeriod(input);
    } catch (error) {
      throw new AppError(400, error instanceof Error ? error.message : "Período inválido");
    }

    const [current, previous, usersCurrent, usersPrevious] = await Promise.all([
      sumOrders(period.start, period.end),
      sumOrders(period.previousStart, period.previousEnd),
      countUsers(period.start, period.end),
      countUsers(period.previousStart, period.previousEnd),
    ]);

    const conversionsCurrent = current.orders;
    const conversionsPrevious = previous.orders;
    const profitCurrent = current.revenue * 0.28;
    const profitPrevious = previous.revenue * 0.28;

    return {
      period: {
        range: input.range,
        label: period.label,
        from: period.start.toISOString(),
        to: period.end.toISOString(),
      },
      kpis: [
        {
          key: "revenue",
          label: "Receita",
          value: current.revenue,
          previous: previous.revenue,
          change: percentChange(current.revenue, previous.revenue),
          format: "currency" as const,
        },
        {
          key: "users",
          label: "Usuários",
          value: usersCurrent,
          previous: usersPrevious,
          change: percentChange(usersCurrent, usersPrevious),
          format: "number" as const,
        },
        {
          key: "conversions",
          label: "Conversões",
          value: conversionsCurrent,
          previous: conversionsPrevious,
          change: percentChange(conversionsCurrent, conversionsPrevious),
          format: "number" as const,
        },
        {
          key: "orders",
          label: "Pedidos",
          value: current.orders,
          previous: previous.orders,
          change: percentChange(current.orders, previous.orders),
          format: "number" as const,
        },
        {
          key: "avgTicket",
          label: "Ticket Médio",
          value: current.avgTicket,
          previous: previous.avgTicket,
          change: percentChange(current.avgTicket, previous.avgTicket),
          format: "currency" as const,
        },
        {
          key: "profit",
          label: "Lucro",
          value: profitCurrent,
          previous: profitPrevious,
          change: percentChange(profitCurrent, profitPrevious),
          format: "currency" as const,
        },
      ],
    };
  },

  async getCharts(input: DashboardPeriodInput) {
    let period;
    try {
      period = resolvePeriod(input);
    } catch (error) {
      throw new AppError(400, error instanceof Error ? error.message : "Período inválido");
    }

    const granularity = chooseGranularity(period.start, period.end);
    const buckets = buildBuckets(period.start, period.end, granularity);

    const [orders, users, topProductsRaw, sourcesRaw] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: period.start, lte: period.end },
          status: "completed",
        },
        select: { createdAt: true, total: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: period.start, lte: period.end } },
        select: { createdAt: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            createdAt: { gte: period.start, lte: period.end },
            status: "completed",
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.groupBy({
        by: ["source"],
        where: {
          createdAt: { gte: period.start, lte: period.end },
          status: "completed",
        },
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
      }),
    ]);

    const revenueMap = new Map<string, number>();
    const ordersMap = new Map<string, number>();
    const usersMap = new Map<string, number>();
    const conversionMap = new Map<string, number>();

    for (const key of buckets) {
      revenueMap.set(key, 0);
      ordersMap.set(key, 0);
      usersMap.set(key, 0);
      conversionMap.set(key, 0);
    }

    for (const order of orders) {
      const key = formatBucketKey(order.createdAt, granularity);
      if (!revenueMap.has(key)) continue;
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + toNumber(order.total));
      ordersMap.set(key, (ordersMap.get(key) ?? 0) + 1);
      conversionMap.set(key, (conversionMap.get(key) ?? 0) + 1);
    }

    for (const user of users) {
      const key = formatBucketKey(user.createdAt, granularity);
      if (!usersMap.has(key)) continue;
      usersMap.set(key, (usersMap.get(key) ?? 0) + 1);
    }

    const productIds = topProductsRaw.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productName = new Map(products.map((item) => [item.id, item.name]));

    return {
      period: {
        range: input.range,
        label: period.label,
        from: period.start.toISOString(),
        to: period.end.toISOString(),
        granularity,
      },
      revenueByPeriod: buckets.map((key) => ({
        label: key,
        value: Number((revenueMap.get(key) ?? 0).toFixed(2)),
      })),
      newUsers: buckets.map((key) => ({
        label: key,
        value: usersMap.get(key) ?? 0,
      })),
      orders: buckets.map((key) => ({
        label: key,
        value: ordersMap.get(key) ?? 0,
      })),
      conversion: buckets.map((key) => ({
        label: key,
        value: conversionMap.get(key) ?? 0,
      })),
      topProducts: topProductsRaw.map((item) => ({
        name: productName.get(item.productId) ?? "Produto",
        value: item._sum.quantity ?? 0,
      })),
      userSources: sourcesRaw.map((item) => ({
        name: item.source ?? "Direto",
        value: item._count._all,
      })),
    };
  },
};
