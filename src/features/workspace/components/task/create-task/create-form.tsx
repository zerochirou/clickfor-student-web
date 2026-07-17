"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, ControllerRenderProps, ControllerFieldState } from "react-hook-form";
import { parseDate } from "chrono-node";
import { CalendarIcon, Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form Components
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

// DatePicker Components
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  CreateTaskDTO,
  createTaskSchema,
} from "@/features/workspace/lib/create-task-schema";
import { postTaskAction } from "@/features/workspace/actions/post-task-action";

// --- HELPER FUNCTION ---
function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// --- SUB-COMPONENT UNTUK DUE DATE ---
// Dibuat terpisah agar state (open, inputValue) tidak merender ulang seluruh form
function DueDateField({
  field,
  fieldState,
}: {
  field: ControllerRenderProps<CreateTaskDTO, "dueDate">;
  fieldState: ControllerFieldState;
}) {
  const [open, setOpen] = React.useState(false);
  
  // State lokal untuk teks yang diketik (misal: "Next friday")
  const [inputValue, setInputValue] = React.useState(
    field.value ? formatDate(new Date(field.value)) : ""
  );

  // Parse nilai valid dari react-hook-form
  const date = field.value ? new Date(field.value) : undefined;

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Due Date</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          value={inputValue}
          placeholder="e.g., Tomorrow, next week, or 12 Dec 2026"
          onChange={(e) => {
            setInputValue(e.target.value);
            // Coba ekstrak tanggal dari natural language
            const parsedDate = parseDate(e.target.value);
            if (parsedDate) {
              field.onChange(parsedDate.toISOString()); // Simpan sebagai ISO String
            } else {
              field.onChange(undefined); // Kosongkan jika teks tidak valid
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          onBlur={field.onBlur}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id="date-picker"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                  type="button" // Penting: type="button" agar tidak mensubmit form
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              sideOffset={8}
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                defaultMonth={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    field.onChange(selectedDate.toISOString());
                    setInputValue(formatDate(selectedDate));
                  } else {
                    field.onChange(undefined);
                    setInputValue("");
                  }
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      
      {/* Tampilkan deskripsi tanggal valid yang terbaca */}
      {date ? (
        <FieldDescription>
          Task is due on <span className="font-medium text-primary">{formatDate(date)}</span>.
        </FieldDescription>
      ) : (
        <FieldDescription>
          Set a deadline for the task (Optional).
        </FieldDescription>
      )}
      
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}

// --- MAIN COMPONENT ---
export function CreateTaskForm({ id, topic_id }: { id: string; topic_id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<CreateTaskDTO>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      topicId: topic_id,
      name: "",
      description: "",
      minAverageScore: 0,
      dueDate: undefined, // Tambahkan default value untuk dueDate
    },
  });

  const handleCreateTask = async (data: CreateTaskDTO) => {
    startTransition(async () => {
      const response = await postTaskAction(data, topic_id);
      
      if (response.success) {
        toast.success("Task created successfully");
        router.push(`/workspace/subjects/${id}/topics/${topic_id}`);
      } else {
        toast.error("Failed to create task");
      }
    });
  };

  return (
    <form
      id="create-task-form"
      onSubmit={form.handleSubmit(handleCreateTask)}
      className="space-y-6"
    >
      <div className="font-bold text-3xl mt-2">Create Task</div>
      <div className="opacity-50 -mt-4">
        Task is a specific activity or assignment within the topic
      </div>

      <FieldGroup>
        {/* NAME FIELD */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Task Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Final Assignment"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* TASK DESCRIPTION FIELD */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                value={field.value || ""}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Brief description of the task"
                autoComplete="off"
              />
              <FieldDescription>
                Additional details about the task (Optional).
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* DUE DATE FIELD */}
        <Controller
          name="dueDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <DueDateField field={field} fieldState={fieldState} />
          )}
        />

        {/* MIN AVERAGE SCORE FIELD */}
        <Controller
          name="minAverageScore"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Minimum Average Score
              </FieldLabel>
              <Input
                {...field}
                type="number"
                value={field.value || ""}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="e.g., 75"
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val ? Number(val) : undefined);
                }}
              />
              <FieldDescription>
                Set the minimum passing score (Optional).
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner /> Loading...
          </>
        ) : (
          <>
            Submit <Plus className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
}