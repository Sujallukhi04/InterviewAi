"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChartDataItem {
  sessionNumber: number;
  date: string;
  type: string;
  communication: number;
  depth: number;
  structure: number;
  confidence: number;
  overall: number;
}

interface ProgressChartProps {
  data: ChartDataItem[];
}

const DIMENSIONS = [
  { key: "overall", label: "Overall", color: "#00FF87" },
  { key: "communication", label: "Communication", color: "#3B82F6" },
  { key: "depth", label: "Depth", color: "#8B5CF6" },
  { key: "structure", label: "Structure", color: "#F97316" },
  { key: "confidence", label: "Confidence", color: "#F59E0B" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
    color: string;
    name: string;
    value: number;
    dataKey: string;
  }>;
  visibleLines?: Set<string>;
}

const CustomTooltip = ({ active, payload, visibleLines }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#111111] border border-[#1A1A1A] p-3 rounded-lg text-xs space-y-1 shadow-2xl text-left min-w-44">
        <div className="font-bold text-white">
          Interview #{item.sessionNumber} &middot; {item.date}
        </div>
        <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider capitalize mb-2">
          {item.type.replace(/([A-Z])/g, " $1").trim()}
        </div>
        <div className="space-y-1 pt-1.5 border-t border-zinc-900">
          {DIMENSIONS.map((dim) => {
            if (visibleLines && !visibleLines.has(dim.key)) return null;
            const val = (item as unknown as Record<string, number>)[dim.key];
            return (
              <div key={dim.key} className="flex items-center justify-between text-zinc-300">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />
                  <span className="text-[11px] font-medium">{dim.label}</span>
                </div>
                <span className="font-bold text-white pl-3">{val}/10</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProgressChart({ data }: ProgressChartProps) {
  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    new Set(["overall", "communication", "depth", "structure", "confidence"])
  );

  const toggleLine = (key: string) => {
    setVisibleLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (data.length < 2) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-8 shadow-lg text-center flex flex-col items-center justify-center py-14 space-y-4">
        <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800 text-emerald-500/80 mb-2">
          <TrendingUp className="h-10 w-10 text-[#00FF87]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Unlock performance trends</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            Complete at least 2 interviews to see your progress chart.
          </p>
        </div>
        <Link
          href="/interview/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          Start Interview
        </Link>
      </div>
    );
  }



  return (
    <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-5 md:p-6 shadow-xl space-y-6">
      
      {/* Card Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/60 pb-5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Performance Over Time</h3>
          <p className="text-zinc-400 text-xs font-medium">
            Score trends across all completed interviews
          </p>
        </div>

        {/* Score Toggle Pills */}
        <div className="flex flex-wrap gap-1.5">
          {DIMENSIONS.map((dim) => {
            const isVisible = visibleLines.has(dim.key);
            return (
              <button
                key={dim.key}
                onClick={() => toggleLine(dim.key)}
                style={{
                  backgroundColor: isVisible ? `${dim.color}15` : "#1A1A1A",
                  borderColor: isVisible ? `${dim.color}35` : "transparent",
                  color: isVisible ? dim.color : "#71717A",
                }}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded-md border text-xs font-semibold cursor-pointer transition-all hover:brightness-110"
                )}
              >
                {dim.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Area */}
      <div className="w-full h-[280px] select-none">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717A", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={data.length > 8 ? 1 : 0}
              dy={10}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fill: "#71717A", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              content={<CustomTooltip visibleLines={visibleLines} />}
              cursor={{ stroke: "#27272A", strokeWidth: 1 }}
            />
            
            {/* Legend hidden, custom button toggles exist instead */}
            {DIMENSIONS.map((dim) => (
              <Line
                key={dim.key}
                type="monotone"
                dataKey={dim.key}
                name={dim.label}
                stroke={dim.color}
                strokeWidth={dim.key === "overall" ? 2 : 1.5}
                dot={dim.key === "overall" ? { fill: dim.color, r: 4 } : false}
                activeDot={dim.key === "overall" ? { r: 6, fill: dim.color } : { r: 4 }}
                connectNulls
                hide={!visibleLines.has(dim.key)}
                legendType="none"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
