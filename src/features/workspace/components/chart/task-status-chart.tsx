"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Interface Task dari Anda
export interface Task {
  id: string;
  name: string;
  topicId: string;
  description: string;
  minAverageScore: number;
  averageScore: number;
  totalScore: number;
  efficientScore: number;
  status: "open" | "closed" | string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
}

interface TaskStatusRadialChartProps {
  tasks: Task[];
}

export function TaskStatusRadialChart({ tasks }: TaskStatusRadialChartProps) {
  // 1. Menghitung total seluruh task
  const totalTasks = tasks.length;

  // 2. Mengelompokkan dan menghitung task berdasarkan statusnya
  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Memformat data untuk Recharts
  const chartData = Object.entries(statusCounts).map(([status, count], index) => {
    const colorIndex = (index % 5) + 1;
    return {
      status, // Akan dipakai sebagai nama kategori
      count,  // Nilai kuantitas
      fill: `var(--chart-${colorIndex})`,
    };
  });

  // 4. Membuat konfigurasi warna secara dinamis
  const chartConfig = {
    count: {
      label: "Total",
    },
  } as ChartConfig;

  Object.keys(statusCounts).forEach((status, index) => {
    const colorIndex = (index % 5) + 1;
    chartConfig[status] = {
      label: status.charAt(0).toUpperCase() + status.slice(1), // Kapitalisasi huruf pertama
      color: `var(--chart-${colorIndex})`,
    };
  });

  return (
    <Card className="flex flex-col bg-background">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status Task</CardTitle>
        <CardDescription>Distribusi task berdasarkan status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalTasks > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-62.5"
          >
            <RadialBarChart
              data={chartData}
              innerRadius={40} // Diperkecil agar muat beberapa cincin
              outerRadius={110} // Diperbesar sebagai batas luar cincin
              barSize={15} // Ketebalan cincin
            >
              {/* Tooltip agar pengguna bisa melihat detail jumlah saat di-hover */}
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="status" />}
              />
              
              <RadialBar 
                dataKey="count" 
                background 
                cornerRadius={10} 
              />
              
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-4xl font-bold"
                          >
                            {totalTasks.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Tasks
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        ) : (
          <div className="flex aspect-square max-h-[250px] items-center justify-center text-muted-foreground">
            Belum ada task yang tersedia.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-6">
        <div className="flex items-center gap-2 leading-none font-medium">
          Menampilkan ringkasan status <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Berdasarkan total keseluruhan task saat ini
        </div>
      </CardFooter>
    </Card>
  )
}