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
} from "lucide-react";

// Komponen UI
import { Card } from "@/components/ui/card";
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
import { Field, FieldError } from "@/components/ui/field";

// Types & Actions
import { Task } from "@/types/task";
import { patchPartialTaskNoteAction } from "../../actions/patch-partial-task-action";

// --- SCHEMA UNTUK EDIT TASK ---
const editTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
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
            // ✅ PASTIKAN DIUBAH KE TOISOSTRING()
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
                  // ✅ UBAH KE ISO STRING SEBELUM DIKIRIM KE FORM
                  field.onChange(selectedDate.toISOString());
                  setInputValue(
                    formatReadableDate(selectedDate.toISOString()) || "",
                  );
                } else {
                  field.onChange(null); // Kosongkan tanggal
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
  const router = useRouter();

  // Konfigurasi Form
  const form = useForm<EditTaskDTO>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: task.name,
      description: task.description || "",
      dueDate: task.dueDate || null,
    },
  });

  // Action untuk Toggle Status (Selesai/Belum)
  const handleToggleStatus = () => {
    if (isPending || isEditing) return;
    startTransition(async () => {
      const newStatus = task.status === "open" ? "closed" : "open";
      const formData = new FormData();
      formData.append("status", newStatus);

      const { success } = await patchPartialTaskNoteAction(task.id, formData);
      if (!success) toast.error("Failed to update status");
      router.refresh();
    });
  };

  // Action untuk Simpan Edit
  const onSubmitEdit = (data: EditTaskDTO) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      if (data.dueDate) {
        formData.append("dueDate", data.dueDate);
      } else {
        formData.append("dueDate", ""); // Clear date
      }

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
  console.log(task.dueDate);

  return (
    <Card
      className={`transition-colors duration-300 overflow-hidden group ${
        task.status === "closed" && !isEditing
          ? "bg-muted/40 border-dashed shadow-none"
          : "bg-card"
      } ${isEditing ? "ring-1 ring-primary shadow-md" : ""}`}
    >
      {/*
        ==============================
        MODE VIEW (TAMPILAN BIASA)
        ==============================
      */}
      {!isEditing && (
        <div className="flex items-start justify-between p-4 gap-4 relative">
          <div className="flex-1 space-y-1.5 pt-0.5">
            <h3
              className={`text-base font-semibold transition-all duration-300 pr-8 ${
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

            {formattedDate && (
              <div
                className={`flex items-center gap-1.5 text-xs mt-2 font-medium ${
                  task.status === "closed"
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            {/* Tombol Check/Uncheck */}
            <button
              type="button"
              onClick={handleToggleStatus}
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
                {isPending ? (
                  <CircleDashed className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : task.status === "closed" ? (
                  <CircleCheck className="w-6 h-6 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground hover:text-foreground" />
                )}
              </div>
            </button>

            {/* Tombol Edit (Muncul saat hover card) */}
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

      {/*
        ==============================
        MODE EDIT (INLINE FORM)
        ==============================
      */}
      {isEditing && (
        <form
          onSubmit={form.handleSubmit(onSubmitEdit)}
          className="p-4 space-y-3"
        >
          <div className="space-y-3">
            {/* Input Name */}
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

            {/* Input Description */}
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

            {/* Input Date Picker */}
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => <InlineDueDateField field={field} />}
            />
          </div>

          {/* Action Buttons */}
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
    </Card>
  );
}
