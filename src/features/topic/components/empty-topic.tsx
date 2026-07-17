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

export function EmptyTopic() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Box />
        </EmptyMedia>
        <EmptyTitle>Topic is Empty</EmptyTitle>
        <EmptyDescription>Create a Topic to get started.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href={"/workspace/topics/create"}>
          <Button variant="outline" size="sm">
            Create Topic
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
