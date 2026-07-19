"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Copy,
  MoreHorizontal,
  SquareArrowOutUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Interface Subject Anda
export type Subject = {
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
};

export const columns: ColumnDef<Subject>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        // 1. checked HANYA menerima boolean murni
        checked={table.getIsAllPageRowsSelected()}
        // 2. Jika Base UI Anda memiliki prop 'indeterminate' terpisah, gunakan ini:
        // indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}

        // 3. Sesuaikan trigger onChange-nya.
        // Jika Base UI menggunakan onCheckedChange dan mengembalikan boolean:
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        // (CATATAN: Jika Base UI Anda menggunakan standar event React, ganti baris di atas dengan:)
        // onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}

        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        // onChange={(event) => row.toggleSelected(event.target.checked)} // <- gunakan ini jika pakai standar event
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    // Membuat kolom nama bisa di-sort
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Pelajaran
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "teacher",
    header: "Guru",
    cell: ({ row }) => {
      const teacher = row.getValue("teacher") as string | null;
      return <div>{teacher || "-"}</div>;
    },
  },
  {
    accessorKey: "averageScore",
    header: () => <div className="text-right">Rata-rata</div>,
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("averageScore"));
      return <div className="text-right font-medium">{score.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "efficientScore",
    header: () => <div className="text-right">Efisiensi</div>,
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("efficientScore"));
      return (
        <div className="text-right font-medium text-muted-foreground">
          {score.toFixed(1)} %
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const subject = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(subject.id)}
              >
                <Copy /> Copy Subject ID 
              </DropdownMenuItem>
              <Link href={`/workspace/subjects/${subject.id}`}>
                <DropdownMenuItem>
                  <SquareArrowOutUpRight /> Open
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
