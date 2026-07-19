"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

// Interface yang Anda sediakan
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

// Konfigurasi chart disesuaikan dengan key dari data Subject
const chartConfig = {
  averageScore: {
    label: "Average Score",
    color: "var(--chart-1)",
  },
  efficientScore: {
    label: "Efficient Score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface SubjectRadarChartProps {
  subjects: Subject[];
}

export function SubjectRadarChart({ subjects }: SubjectRadarChartProps) {
  // Mapping data dari props ke format yang dibutuhkan Recharts
  const chartData = subjects.map((subject) => ({
    name: subject.name,
    averageScore: subject.averageScore,
    efficientScore: subject.efficientScore,
  }))

  return (
    <Card className="bg-background">
      <CardHeader className="items-center">
        <CardTitle>Subject Performance Radar</CardTitle>
        <CardDescription>
          Membandingkan rata-rata nilai antar mata pelajaran
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-75"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            
            {/* Sumbu sudut menggunakan nama mata pelajaran */}
            <PolarAngleAxis dataKey="name" />
            <PolarGrid />
            
            {/* Radar untuk Average Score */}
            <Radar
              dataKey="averageScore"
              fill="var(--color-averageScore)"
              fillOpacity={0.5}
              stroke="var(--color-averageScore)"
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
            
            {/* (Opsional) Radar kedua untuk Efficient Score jika ingin perbandingan */}
            <Radar
              dataKey="efficientScore"
              fill="var(--color-efficientScore)"
              fillOpacity={0.3}
              stroke="var(--color-efficientScore)"
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Tinjauan performa studi <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Berdasarkan {subjects.length} mata pelajaran aktif
        </div>
      </CardFooter>
    </Card>
  )
}