"use client";

import { useTransition } from "react";
import { deleteSubjectAction } from "../api/delete-subject-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Subject } from "@/types/subject";
import { SquareArrowOutUpRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export function SubjectCard({ subject }: { subject: Subject }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const { success } = await deleteSubjectAction(id);
      if (success) {
        toast.success("Subject deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete subject");
      }
    });
  };

  return (
    <Card key={subject.id} className="md:py-6 py-4">
      <CardContent className="flex md:flex-row flex-col md:items-center gap-4 justify-between md:px-6 px-4">
        <div>
          <CardTitle>{subject.name}</CardTitle>
          <CardDescription className="md:w-100 w-80 truncate">{subject.description}</CardDescription>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Link prefetch href={`/workspace/subjects/${subject.id}`}>
            <Button variant={"outline"}>
              Open <SquareArrowOutUpRight />
            </Button>
          </Link>
          <Button variant={"destructive"} onClick={() => handleDelete(subject.id)}>
            {isPending ? (
              <>
                <Spinner /> Loading
              </>
            ) : (
              <>
                Delete <Trash2 />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
