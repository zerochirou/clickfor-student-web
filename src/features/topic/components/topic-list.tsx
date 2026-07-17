import { Button } from "@/components/ui/button";
import { EmptyTopic } from "./empty-topic";
import { TopicCard } from "./topic-card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Topic } from "@/types/topic";

export function TopicList({ id, topics }: { id: string, topics: Topic[] }) {
  return (
    <div>
      {topics.length < 0 ? (
        <EmptyTopic />
      ) : (
        <div className="max-w-3xl w-full mx-auto">
          <div className="flex justify-end items-center mb-4 gap-2">
            <Link href={`/workspace/subjects/${id}/topics/create`} prefetch>
              <Button variant={"outline"}>
                <Plus /> New Subtrack
              </Button>
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 mt-6">
            {topics.map((topic) => {
              return <TopicCard topic={topic} key={topic.id} />;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
