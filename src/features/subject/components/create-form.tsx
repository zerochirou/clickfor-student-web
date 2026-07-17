"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { postSubjectAction } from "../api/post-subject-action";
import { CreateSubjectDTO, createSubjectSchema } from "../lib/create-subject-schema";

export function CreateSubjectForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateSubjectDTO>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      teacher: "",
      description: "",
      minAverageScore: 0,
      image: undefined,
    },
  });

  const handleCreateSubject = async (data: CreateSubjectDTO) => {
    startTransition(async () => {
      const { success } = await postSubjectAction(data);
      if (success) {
        toast.success("Subject created successfully");
        router.push("/workspace/subjects")
      } else {
        toast.error("Failed to create subject");
      }
    });
  };

  return (
    <form
      id="create-subject-form"
      onSubmit={form.handleSubmit(handleCreateSubject)}
      className="space-y-6"
    >
      <FieldGroup>
        <div className="font-semibold text-3xl">Create Subject</div>
      </FieldGroup>
      <FieldGroup>
        {/* NAME FIELD */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Subject Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Mathematics"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* TEACHER FIELD */}
        <Controller
          name="teacher"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Teacher Name</FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              <FieldDescription>
                Name of the assigned teacher (Optional).
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* DESCRIPTION FIELD */}
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
                placeholder="Brief description of the subject"
                autoComplete="off"
              />
              <FieldDescription>
                Additional details about the subject (Optional).
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
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

        {/* IMAGE FIELD */}
        <Controller
          name="image"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Subject Image</FieldLabel>
              <Input
                type="file"
                accept="image/*"
                id={field.name}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  field.onChange(file || undefined);
                }}
              />
              <FieldDescription>
                Upload a cover image for the subject (Optional).
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full md:w-auto">
        {isPending ? (
          <>
            <Spinner /> Loading...
          </>
        ) : (
          <>
            Submit <Plus />
          </>
        )}
      </Button>
    </form>
  );
}
