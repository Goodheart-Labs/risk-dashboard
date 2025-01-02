import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "../lib/risk-index/types";
import { format } from "date-fns";

interface LineGraphProps {
  data: ChartDataPoint[];
  color: string;
  label: string;
  formatValue?: (value: number) => string;
}

export function LineGraph({
  data,
  color,
  label,
  formatValue = (v: number) => v.toString(),
}: LineGraphProps) {
  return (
    <div className="relative h-[320px] w-full">
      <div className="absolute left-0 top-0 text-sm text-gray-500">{label}</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 40,
            right: 16,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 12,
              // @ts-expect-error recharts types are wrong
              angle: -45,
              textAnchor: "end",
              dy: 5,
            }}
            tickFormatter={(date) => format(new Date(date), "MM/dd")}
          />
          <YAxis
            width={45}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatValue(value)}
          />
          <Tooltip
            formatter={(value: number) => [formatValue(value), label]}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
