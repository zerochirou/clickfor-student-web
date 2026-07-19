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
  Trash2,
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
import { TaskNoteEditor } from "./task-note-editor";
import { deleteTaskAction } from "../api/delete-task";
import { Separator } from "@/components/ui/separator";

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
    year: "numeric"
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
  const [isDeletingPending, startTransitionDelete] = useTransition();

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

  const handleDelete = () => {
    startTransitionDelete(async () => {
      const { success } = await deleteTaskAction(task.id);
      if (success) {
        toast.success("Successfully deleted task");
        router.refresh();
      } else {
        toast.error("Failed to delete task");
      }
    });
  };

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
        className={`transition-all min-w-2xl dark:bg-card bg-sidebar duration-300 overflow-hidden group py-0 rounded-lg ${
          task.status === "closed" && !isEditing
            ? "bg-muted/30 border-dashed shadow-none"
            : "dark:bg-card bg-sidebar shadow-sm hover:shadow-md border-border/60"
        } ${isEditing ? "ring-2 ring-primary/20 shadow-md border-primary/30" : ""}`}
      >
        <CardContent className="p-0">
          {/* VIEW MODE */}
          {!isEditing && (
            <div className="flex items-start gap-3 p-4 relative">
              {/* KIRI: Tombol Toggle Status */}
              <div className="flex-shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={handleToggleClick}
                  disabled={isPending}
                  className={`
                      relative flex items-center justify-center h-6 w-6 rounded-full
                      transition-all duration-300 ease-out outline-none
                      focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                      ${isPending ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                    `}
                >
                  <div
                    className={`absolute inset-0 rounded-full transition-transform duration-300 scale-0 group-hover:scale-100 ${
                      task.status === "closed" ? "bg-primary/10" : "bg-muted"
                    }`}
                  />
                  <div className="relative z-10 transition-transform duration-300 active:scale-90 group-hover:scale-110">
                    {isPending && !isScoreDialogOpen ? (
                      <CircleDashed className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : task.status === "closed" ? (
                      <CircleCheck className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/60 group-hover:text-muted-foreground" />
                    )}
                  </div>
                </button>
              </div>

              {/* TENGAH: Konten Task */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className={`text-base font-semibold leading-tight transition-all duration-300 break-words ${
                      task.status === "closed"
                        ? "opacity-60 line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.name}
                  </h3>

                  {/* KANAN: Action Buttons (Edit & Delete) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Edit task"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pr-10">
                    {task.description}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 items-center pt-1">
                  {formattedDate && (
                    <Badge
                      variant="default"
                      className="flex items-center gap-1.5 text-[11px] font-medium"
                    >
                      <CalendarIcon className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </Badge>
                  )}
                  {task.minAverageScore !== undefined && (
                    <Badge
                      className="flex items-center gap-1.5 text-[11px] font-medium"
                      variant="secondary"
                    >
                      <ChartArea className="w-3 h-3 text-muted-foreground" />
                      <span>Min: {task.minAverageScore}</span>
                    </Badge>
                  )}
                  {task.averageScore !== undefined && (
                    <Badge
                      className="flex items-center gap-1.5 text-[11px] font-medium"
                      variant="secondary"
                    >
                      <Gauge className="w-3 h-3 text-muted-foreground" />
                      <span>Eff: {task.efficientScore}%</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <form
              onSubmit={form.handleSubmit(onSubmitEdit)}
              className="p-4 space-y-4 bg-muted/20"
            >
              <div className="space-y-4">
                {/* Name Field */}
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        placeholder="Task name"
                        className="font-semibold text-base h-10 bg-background"
                        autoFocus
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Description Field */}
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Add details..."
                      className="text-sm min-h-[80px] resize-none bg-background leading-relaxed"
                    />
                  )}
                />

                {/* Due Date */}
                <Controller
                  name="dueDate"
                  control={form.control}
                  render={({ field }) => <InlineDueDateField field={field} />}
                />

                {/* Scores */}
                <div className="flex gap-4">
                  <Controller
                    name="minAverageScore"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="flex-1">
                        <FieldLabel className="text-xs text-muted-foreground">
                          Min Score
                        </FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          className="h-9 bg-background mt-1.5"
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
                        <FieldLabel className="text-xs text-muted-foreground">
                          Efficient %
                        </FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          className="h-9 bg-background mt-1.5"
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

              {/* ACTION BUTTONS (EDIT MODE) */}
              <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                {/* Tombol Delete di Edit Mode */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>

                {/* Tombol Cancel & Save */}
                <div className="flex items-center gap-2">
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
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? (
                      <CircleDashed className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          )}
          <Separator className={'mb-2'}/>
          <div className="p-4">
            <TaskNoteEditor id={task.id} initialContent={task.content} />
          </div>
        </CardContent>
       
      </Card>

      {/* DIALOG UNTUK INPUT SCORE SAAT FINISH TASK (Tetap sama) */}
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
