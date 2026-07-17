"use client";

import {
  ArrowDownToLine,
  BarChart3,
  FileText,
  Gauge,
  Sigma,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Subject } from "@/types/subject";
import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { patchPartialSubjectNoteAction } from "@/features/workspace/actions/patch-partial-subject-action";

export function SubjectHeader({ data }: { data: Subject }) {
  const [values, setValues] = useState({
    name: data.name,
    description: data.description,
    minAverageScore: data.minAverageScore,
    averageScore: data.averageScore,
    efficientScore: data.efficientScore,
    totalScore: data.totalScore,
  });

  const [editingField, setEditingField] = useState<keyof typeof values | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const startEditing = (field: keyof typeof values, currentValue: string | number | null) => {
    setEditingField(field);
    setInputValue(currentValue?.toString() || "");
  };

  const handleCancel = () => {
    setEditingField(null);
    setInputValue("");
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editingField) return;

    if (!inputValue.trim() && editingField !== "description") {
      handleCancel();
      return;
    }

    startTransition(async () => {
      try {
        // Siapkan data FormData untuk Server Action
        const formData = new FormData();
        formData.append(editingField, inputValue);

        // Panggil Server Action dengan ID dari data prop
        await patchPartialSubjectNoteAction(data.id, formData);

        // Update state lokal untuk merefleksikan perubahan secara instan (Optimistic UI)
        setValues((prev) => ({
          ...prev,
          [editingField]: ["name", "description"].includes(editingField) 
            ? inputValue 
            : Number(inputValue),
        }));
        
        setEditingField(null);
      } catch (error) {
        // TODO: Anda bisa menambahkan Toast Notification di sini jika gagal
        console.error("Gagal menyimpan data:", error);
      }
    });
  };

  const cleanInputNumberClass = "w-full min-w-0 bg-transparent font-bold text-2xl p-0 border-b-2 border-dashed border-primary/40 focus:border-primary outline-none ring-0 focus:ring-0 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div>
      <div className="group flex items-center min-h-12">
        {editingField === "name" ? (
          <form onSubmit={handleSave} className="flex items-center gap-3 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-4 w-full">
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isPending}
                onKeyDown={(e) => { if (e.key === "Escape") handleCancel(); }}
                className="w-full bg-transparent font-bold text-5xl p-0 border-none outline-none ring-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground"
                placeholder="Masukkan nama subject..."
              />
              <div className="flex items-center gap-1 shrink-0">
                <Button type="submit" size="icon" variant="default" className="h-8 w-8" disabled={isPending}>
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={handleCancel} disabled={isPending}>
                  <X size={16} />
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <h1
            onClick={() => startEditing("name", values.name)}
            className="font-bold text-5xl cursor-pointer hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors border border-transparent hover:border-border hover:border-dashed"
            title="Klik untuk mengedit"
          >
            {values.name}
          </h1>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2 rounded-xl border-2 bg-card p-4 text-card-foreground border-dashed">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <FileText size={16} />
            <span>Description</span>
          </div>
          
          <div className="min-h-6">
            {editingField === "description" ? (
              <form onSubmit={handleSave} className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") handleCancel();
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSave(e); 
                  }}
                  className="w-full min-h-20 bg-background rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-y text-foreground/80 placeholder:text-muted-foreground"
                  placeholder="Tambahkan deskripsi..."
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button type="button" size="sm" variant="ghost" className="h-8" onClick={handleCancel} disabled={isPending}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" variant="default" className="h-8" disabled={isPending}>
                    {isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
                    Simpan
                  </Button>
                </div>
              </form>
            ) : (
              <p
                onClick={() => startEditing("description", values.description)}
                className="text-sm leading-relaxed text-foreground/80 cursor-pointer hover:bg-muted/50 rounded px-1 -ml-1 py-0.5 transition-colors border border-transparent hover:border-border hover:border-dashed min-h-[1.5rem]"
                title="Klik untuk mengedit deskripsi"
              >
                {values.description || <span className="italic text-muted-foreground">Belum ada deskripsi. Klik untuk menambah...</span>}
              </p>
            )}
          </div>
        </div>

        <TooltipProvider delay={300}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            
            {/* Card: Min Score (BISA DIEDIT) */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border p-4 bg-card">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Min Score</span>
                <Tooltip>
                  <TooltipTrigger render={<ArrowDownToLine size={16} className="cursor-help text-foreground/50 hover:text-foreground transition-colors" />} />
                  <TooltipContent><p>Ambang batas skor terendah</p></TooltipContent>
                </Tooltip>
              </div>
              <div className="min-h-8 flex items-center">
                {editingField === "minAverageScore" ? (
                  <form onSubmit={handleSave} className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="number"
                      step="0.01"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isPending}
                      onKeyDown={(e) => { if (e.key === "Escape") handleCancel(); if (e.key === "Enter") handleSave(e); }}
                      className={cleanInputNumberClass}
                    />
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 rounded-md text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" disabled={isPending}>
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleCancel} disabled={isPending}>
                        <X size={14} strokeWidth={3} />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <span
                    onClick={() => startEditing("minAverageScore", values.minAverageScore)}
                    className="text-2xl font-bold tracking-tight cursor-pointer hover:bg-muted/50 rounded px-1 -ml-1 transition-colors border border-transparent hover:border-border hover:border-dashed"
                  >
                    <NumberTicker value={values.minAverageScore} decimalPlaces={2} />
                  </span>
                )}
              </div>
            </div>

            {/* Card: Average Score (READ ONLY) */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border p-4 bg-card">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Avg Score</span>
                <Tooltip>
                  <TooltipTrigger render={<BarChart3 size={16} className="cursor-help text-foreground/50 hover:text-foreground transition-colors" />} />
                  <TooltipContent><p>Rata-rata skor keseluruhan</p></TooltipContent>
                </Tooltip>
              </div>
              <div className="min-h-8 flex items-center">
                <span className="text-2xl font-bold tracking-tight px-1 -ml-1">
                  <NumberTicker value={values.averageScore} decimalPlaces={2} />
                </span>
              </div>
            </div>

            {/* Card: Efficient Score (READ ONLY) */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border p-4 bg-card">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Efficient</span>
                <Tooltip>
                  <TooltipTrigger render={<Gauge size={16} className="cursor-help text-foreground/50 hover:text-foreground transition-colors" />} />
                  <TooltipContent><p>Tingkat efisiensi metrik</p></TooltipContent>
                </Tooltip>
              </div>
              <div className="min-h-8 flex items-center">
                <span className="text-2xl font-bold tracking-tight text-primary px-1 -ml-1">
                  <NumberTicker value={values.efficientScore} decimalPlaces={2} />
                </span>
              </div>
            </div>

            {/* Card: Total Score (READ ONLY) */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border p-4 bg-card">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Total</span>
                <Tooltip>
                  <TooltipTrigger render={<Sigma size={16} className="cursor-help text-foreground/50 hover:text-foreground transition-colors" />} />
                  <TooltipContent><p>Akumulasi total skor</p></TooltipContent>
                </Tooltip>
              </div>
              <div className="min-h-8 flex items-center">
                <span className="text-2xl font-bold tracking-tight px-1 -ml-1">
                  <NumberTicker value={values.totalScore} decimalPlaces={2} />
                </span>
              </div>
            </div>

          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}