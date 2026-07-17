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
import { ChevronRight } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import {
  CreateTopicDTO,
  createTopicSchema,
} from "../lib/create-topic-schema";
import { postTopicAction } from "@/features/task/api/post-topic-action";

export function CreateTopicForm({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateTopicDTO>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      name: "",
      description: "",
      minAverageScore: 0,
    },
  });

  const handleCreateTopic = async (data: CreateTopicDTO) => {
    startTransition(async () => {
      const { success, data: topic } = await postTopicAction(data, id);
      if (success) {
        toast.success("Topic created successfully");
        router.push(`/workspace/subjects/${id}/topics/${topic.id}`);
      } else {
        toast.error("Failed to create topic");
      }
    });
  };

  return (
    <form
      id="create-topic-form"
      onSubmit={form.handleSubmit(handleCreateTopic)}
      className="space-y-6"
    >
      <div className="font-bold text-3xl mt-2">Create Subtrack</div>
      <div className="opacity-50 -mt-4">
        subtrack is a subsection of the main subject
      </div>

      <FieldGroup>
        {/* NAME FIELD */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Topic Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Phytagoras"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* TOPIC DESCRIPTION FIELD */}
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
                placeholder="Brief description of the topic"
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
      </FieldGroup>

      <Button type="submit" className="w-full md:w-auto">
        {isPending ? (
          <>
            <Spinner /> Loading...
          </>
        ) : (
          <>
            Submit <ChevronRight/>
          </>
        )}
      </Button>
    </form>
  );
}
