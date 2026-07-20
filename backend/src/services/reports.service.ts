import PDFDocument from "pdfkit";
import type { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import { toNumber } from "../utils/period.js";
import type { ListReportsInput } from "../validators/reports.validators.js";

function serializeOrder(order: {
  id: string;
  customerName: string;
  total: { toNumber?: () => number } | number;
  status: string;
  source: string | null;
  createdAt: Date;
  items: { quantity: number }[];
}) {
  return {
    id: order.id,
    customerName: order.customerName,
    total: toNumber(order.total),
    status: order.status,
    source: order.source ?? "Direto",
    itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
  };
}

function buildWhere(search: string): Prisma.OrderWhereInput {
  if (!search) return {};
  return {
    OR: [
      { customerName: { contains: search, mode: "insensitive" } },
      { status: { contains: search, mode: "insensitive" } },
      { source: { contains: search, mode: "insensitive" } },
    ],
  };
}

export const reportsService = {
  async listOrders(input: ListReportsInput) {
    const where = buildWhere(input.search);
    const skip = (input.page - 1) * input.pageSize;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { items: { select: { quantity: true } } },
        orderBy: { [input.sortBy]: input.sortDir },
        skip,
        take: input.pageSize,
      }),
    ]);

    return {
      data: orders.map(serializeOrder),
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
      },
    };
  },

  async listAllForExport(input: Omit<ListReportsInput, "page" | "pageSize">) {
    const where = buildWhere(input.search);
    const orders = await prisma.order.findMany({
      where,
      include: { items: { select: { quantity: true } } },
      orderBy: { [input.sortBy]: input.sortDir },
      take: 5000,
    });
    return orders.map(serializeOrder);
  },

  toCsv(rows: ReturnType<typeof serializeOrder>[]) {
    const header = ["id", "cliente", "total", "status", "origem", "itens", "criado_em"];
    const lines = rows.map((row) =>
      [
        row.id,
        `"${row.customerName.replaceAll('"', '""')}"`,
        row.total.toFixed(2),
        row.status,
        row.source,
        row.itemsCount,
        row.createdAt.toISOString(),
      ].join(","),
    );
    return [header.join(","), ...lines].join("\n");
  },

  async toPdfBuffer(rows: ReturnType<typeof serializeOrder>[]) {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(16).text("Insight Analytics — Relatório de Pedidos");
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#666").text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);
      doc.moveDown();
      doc.fillColor("#000");

      rows.slice(0, 80).forEach((row, index) => {
        doc
          .fontSize(9)
          .text(
            `${index + 1}. ${row.customerName} | R$ ${row.total.toFixed(2)} | ${row.status} | ${row.source} | ${row.createdAt.toLocaleDateString("pt-BR")}`,
          );
      });

      if (rows.length > 80) {
        doc.moveDown().text(`… e mais ${rows.length - 80} registros.`);
      }

      doc.end();
    });
  },
};
