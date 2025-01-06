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

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  formatter: (value: number) => [string, string];
  labelFormatter: (date: string) => string;
}

function CustomTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null;

  const [content] = formatter(payload[0].value);
  const lines = content.split("<br />");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <p className="mb-2 font-medium text-gray-900">
        {labelFormatter(label || "")}
      </p>
      {lines.map((line, i) => {
        // Extract the number between <b> tags if it exists
        const match = line.match(/<b>(.*?)<\/b>/);
        if (match) {
          const [fullMatch, number] = match;
          const [before, after] = line.split(fullMatch);
          return (
            <p key={i} className="whitespace-nowrap text-gray-700">
              {before}
              <span className="font-bold">{number}</span>
              {after}
            </p>
          );
        }
        return (
          <p key={i} className="whitespace-nowrap text-gray-700">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export interface LineGraphProps {
  data: ChartDataPoint[];
  color: string;
  label: string;
  formatValue?: (value: number) => string;
  tickFormatter?: (date: string) => string;
  tooltipFormatter?: (value: number) => [string, string];
  tooltipLabelFormatter?: (date: string) => string;
  domain?: [number, number];
}

export function LineGraph({
  data,
  color,
  label,
  formatValue = (v: number) => v.toString(),
  tickFormatter = (date) => {
    try {
      return format(new Date(date), "MMM d");
    } catch (error) {
      console.error("Invalid date value:", date, error);
      return "Invalid Date";
    }
  },
  tooltipFormatter = (value: number) => [formatValue(value), label],
  tooltipLabelFormatter = (date: string) => {
    try {
      return format(new Date(date), "MMM d");
    } catch (error) {
      console.error("Invalid tooltip date value:", date, error);
      return "Invalid Date";
    }
  },
  domain,
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
            left: 16,
            bottom: 40,
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
            tickFormatter={tickFormatter}
          />
          <YAxis
            width={45}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatValue(value)}
            domain={domain}
          />
          <Tooltip
            content={
              <CustomTooltip
                formatter={tooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
