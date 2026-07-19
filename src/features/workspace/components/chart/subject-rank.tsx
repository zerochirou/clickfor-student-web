"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Mengambil interface Subject yang sudah digunakan sebelumnya
export interface Subject {
  id: string;
  userId: string;
  name: string;
  teacher: string | null;
  description: string | null;
  imageKey: string | null;
  minAverageScore: number;
  averageScore: number;
  totalScore: number;
  efficientScore: number;
  createdAt: string;
  updatedAt: string;
  content?: string;
}

const chartConfig = {
  totalScore: {
    label: "Total Score",
    color: "var(--chart-1)",
  },
  minAverageScore: {
    label: "Min Score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface SubjectRankBarChartProps {
  subjects: Subject[];
}

export function SubjectRankBarChart({ subjects }: SubjectRankBarChartProps) {
  // Mengurutkan berdasarkan totalScore (Peringkat tertinggi ke terendah)
  // dan membatasi tampilan maksimal 3 item
  const chartData = [...subjects]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3)
    .map((subject) => ({
      name: subject.name,
      totalScore: subject.totalScore,
      minAverageScore: subject.minAverageScore,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peringkat Mata Pelajaran</CardTitle>
        <CardDescription>Berdasarkan perolehan skor tertinggi</CardDescription>
      </CardHeader>
      <CardContent >
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                // Menyesuaikan margin kiri agar nama pelajaran yang panjang tidak terpotong total
                left: 20,
              }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                // Memotong nama pelajaran jika terlalu panjang agar layout tetap rapi
                tickFormatter={(value) =>
                  value.length > 12 ? `${value.slice(0, 12)}...` : value
                }
              />

              {/* Tooltip yang akan menampilkan detail skor ketika di-hover */}
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              {/* Bar untuk Total Score */}
              <Bar
                dataKey="totalScore"
                fill="var(--color-totalScore)"
                radius={5}
              />

              {/* Bar untuk Min Average Score */}
              <Bar
                dataKey="minAverageScore"
                fill="var(--color-minAverageScore)"
                radius={5}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Belum ada data mata pelajaran.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Menampilkan Top 3 Mata Pelajaran
        </div>
        <div className="leading-none text-muted-foreground">
          Peringkat diurutkan berdasarkan akumulasi Total Score
        </div>
        {subjects.length > 3 && (
          <div className="text-xs text-muted-foreground mt-2">
            + {subjects.length - 3} pelajaran lainnya tidak ditampilkan
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
