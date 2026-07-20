import { z } from "zod";

export const reportSortBySchema = z.enum([
  "createdAt",
  "total",
  "customerName",
  "status",
  "source",
]);

export const listReportsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(""),
  sortBy: reportSortBySchema.default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListReportsInput = z.infer<typeof listReportsSchema>;
