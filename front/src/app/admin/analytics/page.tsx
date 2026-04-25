"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/auth";
import { Card } from "@/components/ui";

interface Overview {
  totalRevenue: number;
  totalTips: number;
  avgTipPercent: number;
  paymentCount: number;
  npsAverage: number;
  npsCount: number;
  splitUsage: { none: number; equal: number; byItem: number; custom: number };
}

interface TipData {
  tipOptInRate: number;
  avgTipPercent: number;
  totalTips: number;
  benchmarkAvgPercent: number;
  dailyTips: {
    date: string;
    totalTips: number;
    avgPercent: number;
    count: number;
  }[];
}

interface NpsData {
  average: number;
  total: number;
  distribution: { rating: number; count: number }[];
  recentComments: { rating: number; comment: string; date: string }[];
}

interface TableData {
  avgTurnoverMinutes: number;
  totalSessions: number;
  completedSessions: number;
  perTable: { tableNumber: number; sessionCount: number; avgMinutes: number }[];
}

interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
  volume: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatCurrency(minorUnits: number) {
  return new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency: "AZN",
    minimumFractionDigits: 0,
  }).format(minorUnits / 100);
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </Card>
  );
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tips, setTips] = useState<TipData | null>(null);
  const [nps, setNps] = useState<NpsData | null>(null);
  const [tables, setTables] = useState<TableData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchWithAuth("/api/admin/analytics/overview").then((r) => r.json()),
      fetchWithAuth("/api/admin/analytics/tips").then((r) => r.json()),
      fetchWithAuth("/api/admin/analytics/nps").then((r) => r.json()),
      fetchWithAuth("/api/admin/analytics/tables").then((r) => r.json()),
      fetchWithAuth("/api/admin/analytics/heatmap").then((r) => r.json()),
    ])
      .then(([o, t, n, tb, h]) => {
        setOverview(o);
        setTips(t);
        setNps(n);
        setTables(tb);
        setHeatmap(h.heatmap);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  const splitTotal =
    (overview?.splitUsage.none ?? 0) +
    (overview?.splitUsage.equal ?? 0) +
    (overview?.splitUsage.byItem ?? 0) +
    (overview?.splitUsage.custom ?? 0);

  const splitPct = (count: number) =>
    splitTotal > 0 ? Math.round((count / splitTotal) * 100) : 0;

  // Heatmap: find max for scaling
  const maxCount = Math.max(1, ...heatmap.map((c) => c.count));

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={formatCurrency(overview?.totalRevenue ?? 0)}
        />
        <StatCard
          label="Tips (30d)"
          value={formatCurrency(overview?.totalTips ?? 0)}
          sub={`Avg: ${overview?.avgTipPercent ?? 0}%`}
        />
        <StatCard
          label="Payments"
          value={String(overview?.paymentCount ?? 0)}
        />
        <StatCard
          label="NPS Score"
          value={`${overview?.npsAverage ?? 0} / 5`}
          sub={`${overview?.npsCount ?? 0} reviews`}
        />
      </div>

      {/* Split Method Usage */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Split Method Breakdown
        </h2>
        <div className="space-y-3">
          {[
            {
              label: "Full Bill (No Split)",
              count: overview?.splitUsage.none ?? 0,
            },
            { label: "Equal Split", count: overview?.splitUsage.equal ?? 0 },
            { label: "By Item", count: overview?.splitUsage.byItem ?? 0 },
            { label: "Custom", count: overview?.splitUsage.custom ?? 0 },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.label}</span>
                <span className="font-medium text-gray-900">
                  {item.count} ({splitPct(item.count)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${splitPct(item.count)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Tip Analytics */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Tip Analytics
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tip Opt-in Rate</span>
              <span className="font-medium">{tips?.tipOptInRate ?? 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Avg Tip %</span>
              <span className="font-medium">
                {tips?.avgTipPercent ?? 0}%
                <span className="ml-1 text-xs text-gray-400">
                  (benchmark: {tips?.benchmarkAvgPercent ?? 18}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Tips (30d)</span>
              <span className="font-medium">
                {formatCurrency(tips?.totalTips ?? 0)}
              </span>
            </div>
          </div>
          {tips && tips.dailyTips.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-gray-400">
                Daily tip volume
              </p>
              <div className="flex items-end gap-px" style={{ height: 80 }}>
                {tips.dailyTips.map((d) => {
                  const maxTip = Math.max(
                    1,
                    ...tips.dailyTips.map((x) => x.totalTips)
                  );
                  const h = Math.max(2, (d.totalTips / maxTip) * 100);
                  return (
                    <div
                      key={d.date}
                      className="flex-1 rounded-t bg-teal-400"
                      style={{ height: `${h}%` }}
                      title={`${d.date}: ${formatCurrency(d.totalTips)} (${d.count} payments)`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* NPS / Customer Satisfaction */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Customer Satisfaction
          </h2>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {nps?.average ?? 0}
            </span>
            <span className="text-sm text-gray-400">
              / 5 ({nps?.total ?? 0} reviews)
            </span>
          </div>
          {/* Rating distribution */}
          <div className="space-y-1.5">
            {(nps?.distribution ?? []).map((d) => {
              const pct =
                nps && nps.total > 0
                  ? Math.round((d.count / nps.total) * 100)
                  : 0;
              return (
                <div key={d.rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-gray-500">{d.rating}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-gray-400">
                    {d.count}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Recent comments */}
          {nps && nps.recentComments.length > 0 && (
            <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
              <p className="text-xs font-medium text-gray-400">
                Recent comments
              </p>
              {nps.recentComments.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-gray-50 p-2.5 text-sm text-gray-700"
                >
                  <span className="mr-1 text-xs text-amber-500">
                    {"★".repeat(c.rating)}
                  </span>
                  {c.comment}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Peak Hours Heatmap */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Peak Hours Heatmap
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="py-1 pr-2 text-left text-gray-400" />
                {Array.from({ length: 24 }, (_, h) => (
                  <th key={h} className="px-0.5 text-center text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAY_LABELS.map((label, dayIdx) => (
                <tr key={dayIdx}>
                  <td className="pr-2 text-right font-medium text-gray-500">
                    {label}
                  </td>
                  {Array.from({ length: 24 }, (_, hourIdx) => {
                    const cell = heatmap.find(
                      (c) => c.day === dayIdx && c.hour === hourIdx
                    );
                    const intensity = cell ? cell.count / maxCount : 0;
                    return (
                      <td key={hourIdx} className="px-0.5 py-0.5">
                        <div
                          className="mx-auto h-4 w-full rounded-sm"
                          style={{
                            backgroundColor:
                              intensity > 0
                                ? `rgba(13, 148, 136, ${0.15 + intensity * 0.85})`
                                : "#f3f4f6",
                          }}
                          title={
                            cell
                              ? `${label} ${hourIdx}:00 — ${cell.count} payments`
                              : `${label} ${hourIdx}:00 — 0 payments`
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Table Turnover */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Table Turnover
        </h2>
        <div className="mb-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Avg Turnover: </span>
            <span className="font-medium">
              {tables?.avgTurnoverMinutes ?? 0} min
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Sessions: </span>
            <span className="font-medium">{tables?.totalSessions ?? 0}</span>
          </div>
        </div>
        {tables && tables.perTable.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 font-medium">Table</th>
                  <th className="pb-2 font-medium">Sessions</th>
                  <th className="pb-2 font-medium">Avg Time (min)</th>
                </tr>
              </thead>
              <tbody>
                {tables.perTable.map((t) => (
                  <tr key={t.tableNumber} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">
                      Table {t.tableNumber}
                    </td>
                    <td className="py-2 text-gray-700">{t.sessionCount}</td>
                    <td className="py-2 text-gray-700">
                      {Math.round(t.avgMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
