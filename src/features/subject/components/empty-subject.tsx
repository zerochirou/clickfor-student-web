import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Box } from "lucide-react";
import Link from "next/link";

export function EmptySubject() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Box />
        </EmptyMedia>
        <EmptyTitle>Subject Empty</EmptyTitle>
        <EmptyDescription>Create a subject to get started.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href={"/workspace/subjects/create"}>
          <Button variant="outline" size="sm">
            Create Subject
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
