import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint, NamedValue } from "@/types/dashboard";
import { formatChartLabel, formatCompact, formatCurrency, formatNumber } from "@/utils/format";

const ACCENT = "#38bdf8";
const MUTED = "#737373";
const GRID = "#262626";
const PIE_COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb7185"];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-72 rounded-(--radius-lg) border border-border bg-surface p-4">
      <p className="mb-4 text-sm font-medium text-foreground">{title}</p>
      <div className="h-56">{children}</div>
    </div>
  );
}

function tooltipStyle() {
  return {
    background: "#171717",
    border: "1px solid #262626",
    borderRadius: 8,
    fontSize: 12,
  };
}

export function RevenueChart({
  data,
  granularity,
}: {
  data: ChartPoint[];
  granularity: "day" | "month";
}) {
  const mapped = data.map((item) => ({
    ...item,
    label: formatChartLabel(item.label, granularity),
  }));

  return (
    <ChartCard title="Receita por período">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mapped}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
          <Tooltip
            contentStyle={tooltipStyle()}
            formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
          />
          <Area type="monotone" dataKey="value" stroke={ACCENT} fill="url(#revenueFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function UsersChart({
  data,
  granularity,
}: {
  data: ChartPoint[];
  granularity: "day" | "month";
}) {
  const mapped = data.map((item) => ({
    ...item,
    label: formatChartLabel(item.label, granularity),
  }));

  return (
    <ChartCard title="Novos usuários">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mapped}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={tooltipStyle()}
            formatter={(value) => [formatNumber(Number(value)), "Usuários"]}
          />
          <Bar dataKey="value" fill={ACCENT} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function OrdersChart({
  data,
  granularity,
}: {
  data: ChartPoint[];
  granularity: "day" | "month";
}) {
  const mapped = data.map((item) => ({
    ...item,
    label: formatChartLabel(item.label, granularity),
  }));

  return (
    <ChartCard title="Pedidos">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mapped}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={tooltipStyle()}
            formatter={(value) => [formatNumber(Number(value)), "Pedidos"]}
          />
          <Area type="monotone" dataKey="value" stroke="#34d399" fill="#34d39933" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ConversionChart({
  data,
  granularity,
}: {
  data: ChartPoint[];
  granularity: "day" | "month";
}) {
  const mapped = data.map((item) => ({
    ...item,
    label: formatChartLabel(item.label, granularity),
  }));

  return (
    <ChartCard title="Conversões">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mapped}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={tooltipStyle()}
            formatter={(value) => [formatNumber(Number(value)), "Conversões"]}
          />
          <Bar dataKey="value" fill="#fbbf24" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopProductsChart({ data }: { data: NamedValue[] }) {
  return (
    <ChartCard title="Top produtos">
      {data.length === 0 ? (
        <p className="text-sm text-muted">Sem vendas no período.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle()}
              formatter={(value) => [formatNumber(Number(value)), "Unidades"]}
            />
            <Bar dataKey="value" fill={ACCENT} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function SourcesChart({ data }: { data: NamedValue[] }) {
  return (
    <ChartCard title="Origem dos usuários">
      {data.length === 0 ? (
        <p className="text-sm text-muted">Sem origem no período.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle()}
              formatter={(value) => [formatNumber(Number(value)), "Pedidos"]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
