import { z } from "zod";

export const dashboardPeriodSchema = z.object({
  range: z
    .enum(["today", "7d", "30d", "90d", "year", "custom"])
    .default("30d"),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type DashboardPeriodInput = z.infer<typeof dashboardPeriodSchema>;
