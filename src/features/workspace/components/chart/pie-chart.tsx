"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

// Interface Subject sesuai dengan format Anda
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

interface SubjectPieChartProps {
  subjects: Subject[];
}

export function SubjectPieChart({ subjects }: SubjectPieChartProps) {
  // 1. Menyiapkan konfigurasi dasar untuk tooltip (Score)
  const chartConfig = {
    averageScore: {
      label: "Average Score",
    },
  } as ChartConfig

  // 2. Memetakan data dinamis ke format Pie Chart sekaligus menambahkan warna dinamis
  const chartData = subjects.map((subject, index) => {
    // Membuat ID warna (asumsi tema memiliki 5 warna default: chart-1 s/d chart-5)
    // Jika lebih dari 5, warnanya akan kembali diulang dari 1
    const colorIndex = (index % 5) + 1;
    const colorVar = `var(--chart-${colorIndex})`;
    
    // Mendaftarkan warna dan label ke dalam chartConfig berdasarkan nama subject
    chartConfig[subject.name] = {
      label: subject.name,
      color: colorVar,
    };

    return {
      name: subject.name,
      averageScore: subject.averageScore,
      fill: colorVar,
    }
  })

  return (
    <Card className="flex flex-col bg-background">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribusi Nilai Rata-rata</CardTitle>
        <CardDescription>Berdasarkan seluruh mata pelajaran</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {subjects.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-70 pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie 
                data={chartData} 
                dataKey="averageScore" 
                nameKey="name" 
                label 
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex aspect-square max-h-[300px] items-center justify-center text-muted-foreground">
            Belum ada data mata pelajaran.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-6">
        <div className="flex items-center gap-2 leading-none font-medium">
          Tinjauan proporsi nilai per pelajaran <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Menampilkan total rata-rata untuk {subjects.length} subjek aktif
        </div>
      </CardFooter>
    </Card>
  )
}