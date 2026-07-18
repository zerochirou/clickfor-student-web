"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { parseDate } from "chrono-node";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  CalendarIcon,
  Circle,
  CircleCheck,
  CircleDashed,
  Pencil,
  X,
  Check,
  ChartArea,
  Gauge,
} from "lucide-react";

// Komponen UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

// Komponen Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Types & Actions
import { Task } from "@/types/task";
import { patchPartialTaskNoteAction } from "../api/patch-partial-task-action";

// --- SCHEMA UNTUK EDIT TASK ---
const editTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  // Tambahkan ini
  minAverageScore: z.coerce.number().optional().nullable(),
  efficientScore: z.coerce.number().optional().nullable(),
});
type EditTaskDTO = z.infer<typeof editTaskSchema>;

// --- HELPER FORMAT TANGGAL ---
function formatReadableDate(dateString: string | undefined | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(date);
}

// --- KOMPONEN DATEPICKER UNTUK EDIT ---
function InlineDueDateField({
  field,
}: {
  field: ControllerRenderProps<EditTaskDTO, "dueDate">;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    field.value ? formatReadableDate(field.value) || "" : "",
  );

  const date = field.value ? new Date(field.value) : undefined;

  return (
    <InputGroup className="w-full mt-2">
      <InputGroupInput
        id="dueDate"
        value={inputValue}
        placeholder="Due date (e.g., Tomorrow, Next Friday)"
        className="h-9 text-sm"
        onChange={(e) => {
          setInputValue(e.target.value);
          const parsedDate = parseDate(e.target.value);

          if (parsedDate) {
            field.onChange(parsedDate.toISOString());
          } else if (e.target.value === "") {
            field.onChange(null);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                type="button"
                className="h-9 w-9"
              >
                <CalendarIcon className="w-4 h-4" />
              </InputGroupButton>
            }
          />
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  field.onChange(selectedDate.toISOString());
                  setInputValue(
                    formatReadableDate(selectedDate.toISOString()) || "",
                  );
                } else {
                  field.onChange(null);
                  setInputValue("");
                }
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}

// --- MAIN TASK CARD COMPONENT ---
export function TaskCard({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  // State khusus untuk Dialog Score
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState("");

  const router = useRouter();

  const form = useForm<EditTaskDTO>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: task.name,
      description: task.description || "",
      dueDate: task.dueDate || null,
      // Tambahkan ini
      minAverageScore: task.minAverageScore ?? null,
      efficientScore: task.efficientScore ?? null,
    },
  });

  // Action ketika tombol checklist ditekan di tampilan awal
  const handleToggleClick = () => {
    if (isPending || isEditing) return;

    if (task.status === "open") {
      // Jika mau menyelesaikan task, buka dialog dulu
      setIsScoreDialogOpen(true);
    } else {
      // Jika mau uncheck (batal selesai), langsung panggil API tanpa dialog
      submitStatusUpdate("open");
    }
  };

  // Action untuk memproses pembaruan status ke API (Bisa dipanggil dari Card atau dari dalam Dialog)
  const submitStatusUpdate = (
    newStatus: "open" | "closed",
    finalScore?: string,
  ) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("status", newStatus);

      if (finalScore) {
        formData.append("totalScore", finalScore);
      }

      const { success, errors } = await patchPartialTaskNoteAction(
        task.id,
        formData,
      );

      if (success) {
        toast.success(
          `Task ${newStatus === "closed" ? "completed" : "reopened"}`,
        );
        setIsScoreDialogOpen(false);
        setScoreInput(""); // Reset input setelah berhasil
        router.refresh();
      } else {
        toast.error("Failed to update status");
        console.error(errors);
      }
    });
  };

  // Action untuk Simpan Edit teks & tanggal
  const onSubmitEdit = (data: EditTaskDTO) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("dueDate", data.dueDate || "");

      // Tambahkan ini
      formData.append(
        "minAverageScore",
        data.minAverageScore?.toString() || "",
      );
      formData.append("efficientScore", data.efficientScore?.toString() || "");

      const { success, errors } = await patchPartialTaskNoteAction(
        task.id,
        formData,
      );
      if (success) {
        toast.success("Task updated");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error("Failed to update task");
        console.error(errors);
      }
    });
  };

  const formattedDate = formatReadableDate(task.dueDate);

  return (
    <>
      <Card
        className={`transition-colors duration-300 overflow-hidden group py-0 rounded-sm ${
          task.status === "closed" && !isEditing
            ? "bg-muted/40 border-dashed shadow-none"
            : ""
        } ${isEditing ? "ring-1 ring-primary shadow-md" : ""}`}
      >
        <CardContent className="p-0">
          {/* VIEW MODE */}
          {!isEditing && (
            <div className="flex items-start justify-between p-4 gap-4 relative">
              <div className="flex-1 space-y-1.5 pt-0.5">
                <h3
                  className={`text-xl transition-all duration-300 pr-8 ${
                    task.status === "closed"
                      ? "opacity-60 line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {task.name}
                </h3>

                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
                <div className="flex gap-2 items-center">
                  {formattedDate && (
                    <Badge className="flex items-center gap-1.5 text-xs font-medium">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </Badge>
                  )}
                  {task.minAverageScore !== undefined && (
                    <Badge
                      className="flex items-center gap-1.5 text-xs font-medium"
                      variant="secondary"
                    >
                      <ChartArea className="w-3.5 h-3.5" />
                      <span>Min: {task.minAverageScore}</span>
                    </Badge>
                  )}
                  {task.averageScore !== undefined && (
                    <Badge
                      className="flex items-center gap-1.5 text-xs font-medium"
                      variant="secondary"
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>Efficient: {task.efficientScore}%</span>
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleToggleClick}
                  disabled={isPending}
                  className={`
                    relative flex items-center justify-center h-10 w-10 rounded-full
                    transition-all duration-300 ease-out
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${isPending ? "cursor-not-allowed opacity-70" : ""}
                  `}
                >
                  <div
                    className={`absolute inset-0 rounded-full transition-transform duration-300 scale-0 group-hover:scale-100 ${
                      task.status === "closed" ? "bg-primary/10" : "bg-muted"
                    }`}
                  />
                  <div className="relative z-10 transition-transform duration-300 active:scale-90 group-hover:scale-110">
                    {isPending && !isScoreDialogOpen ? (
                      <CircleDashed className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : task.status === "closed" ? (
                      <CircleCheck className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-foreground" />
                    )}
                  </div>
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground h-7 w-7"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <form
              onSubmit={form.handleSubmit(onSubmitEdit)}
              className="p-4 space-y-3"
            >
              <div className="space-y-3">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        placeholder="Task name"
                        className="font-semibold text-base h-9"
                        autoFocus
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Add details..."
                      className="text-sm min-h-[60px] resize-none"
                    />
                  )}
                />

                <Controller
                  name="dueDate"
                  control={form.control}
                  render={({ field }) => <InlineDueDateField field={field} />}
                />
                <div className="flex gap-4">
                  <Controller
                    name="minAverageScore"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="flex-1">
                        <FieldLabel className="text-xs">Min Score</FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          className="h-9"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name="efficientScore"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="flex-1">
                        <FieldLabel className="text-xs">Efficient %</FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          className="h-9"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </Field>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                  disabled={isPending}
                >
                  <X className="w-4 h-4 mr-1.5" /> Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? (
                    <Spinner className="w-4 h-4 mr-1.5" />
                  ) : (
                    <Check className="w-4 h-4 mr-1.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* DIALOG UNTUK INPUT SCORE SAAT FINISH TASK */}
      <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Please enter the final score for{" "}
              <span className="font-medium text-foreground">{task.name}</span>{" "}
              before marking it as completed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="score">Total Score</FieldLabel>
              <Input
                id="score"
                type="number"
                placeholder="e.g., 85"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && scoreInput.trim() !== "") {
                    e.preventDefault();
                    submitStatusUpdate("closed", scoreInput);
                  }
                }}
                autoFocus
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScoreDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => submitStatusUpdate("closed", scoreInput)}
              disabled={isPending || scoreInput.trim() === ""}
            >
              {isPending ? (
                <Spinner className="w-4 h-4 mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Submit & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
