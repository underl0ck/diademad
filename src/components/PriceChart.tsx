import { useEffect, useRef } from "react";
import {
  createChart, ColorType, LineSeries, LineStyle,
  type IChartApi, type Time,
} from "lightweight-charts";
import type { PriceSeries } from "../lib/valuation/types";

interface Props {
  series: PriceSeries;
  fairValue: number;
}

const UP = "#60a5fa";
const FAIR = "#00A65A";

export function PriceChart({ series, fairValue }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!ref.current || series.points.length === 0) return;

    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      rightPriceScale: { borderColor: "#374151" },
      timeScale: { borderColor: "#374151" },
      autoSize: true,
    });
    chartRef.current = chart;

    const price = chart.addSeries(LineSeries, {
      color: UP, lineWidth: 2, priceLineVisible: false, lastValueVisible: true,
    });
    price.setData(
      series.points.map((p) => ({ time: p.date as Time, value: p.close })),
    );

    const fair = chart.addSeries(LineSeries, {
      color: FAIR, lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false,
    });
    const first = series.points[0].date as Time;
    const last = series.points[series.points.length - 1].date as Time;
    fair.setData([
      { time: first, value: fairValue },
      { time: last, value: fairValue },
    ]);

    chart.timeScale().fitContent();

    return () => { chart.remove(); chartRef.current = null; };
  }, [series, fairValue]);

  return <div ref={ref} className="h-72 w-full" />;
}
