"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface LinkClickData {
  name: string;
  clicks: number;
}

interface TimelineData {
  date: string;
  clicks: number;
}

interface BreakdownData {
  name: string;
  value: number;
}

interface AnalyticsChartProps {
  type: "bar" | "line" | "pie";
  data: LinkClickData[] | TimelineData[] | BreakdownData[];
  title: string;
}

const COLORS = [
  "#1E3A8A",
  "#1E40AF",
  "#2563EB",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#BFDBFE",
];

export default function AnalyticsChart({
  type,
  data,
  title,
}: AnalyticsChartProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded p-4">
      <h3 className="text-sm font-semibold text-[#111827] mb-4">{title}</h3>

      {type === "bar" && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="clicks" fill="#1E3A8A" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {type === "line" && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#1E3A8A"
              strokeWidth={2}
              dot={{ r: 3, fill: "#1E3A8A" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {type === "pie" && (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              iconSize={10}
              formatter={(value) => (
                <span style={{ fontSize: "11px", color: "#6B7280" }}>{value}</span>
              )}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
