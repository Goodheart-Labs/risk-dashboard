import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "../lib/risk-index/types";
import { format } from "date-fns";
import {
  Formatter,
  Payload,
} from "recharts/types/component/DefaultTooltipContent";

interface BarGraphProps {
  data: ChartDataPoint[];
  color: string;
  label: string;
  formatValue?: (value: number) => string;
  tickFormatter?: (date: string) => string;
  tooltipFormatter?: Formatter<number, string>;
  tooltipLabelFormatter?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    label: any,
    payload: Payload<number, string>[],
  ) => React.ReactNode;
}

export function BarGraph({
  data,
  color,
  label,
  formatValue = (v: number) => v.toString(),
  tickFormatter = (date) => format(new Date(date), "MM/dd"),
  tooltipFormatter = (value: number) => [formatValue(value), label],
  tooltipLabelFormatter = (date: string) => format(new Date(date), "MM/dd"),
}: BarGraphProps) {
  return (
    <div className="relative h-[320px] w-full">
      <div className="absolute left-0 top-0 text-sm text-gray-500">{label}</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 40,
            right: 16,
            left: 0,
            bottom: 24,
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
            tickFormatter={formatValue}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabelFormatter}
          />
          <Bar dataKey="value" fill={color} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
