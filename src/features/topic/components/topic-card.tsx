import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartColumn, SquareArrowOutUpRight } from "lucide-react";
import { Topic } from "@/types/topic";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NumberTicker } from "@/components/ui/number-ticker";

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Card className="border-dashed border hover:bg-card/90 transition-all ease-in-out">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold tracking-wider">
            {topic.name}
          </CardTitle>
          <CardDescription className="md:w-100 w-80 truncate">{topic.description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger
              render={
                <Button variant={"outline"}>
                  <ChartColumn /> Min Score{" "}
                  <span className="text-primary">
                    <NumberTicker
                      value={topic.minAverageScore}
                      decimalPlaces={1}
                    />
                  </span>
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Min Score: {topic.minAverageScore}</DialogTitle>
                <DialogDescription>
                  This is the minimum average score required to pass this topic.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Link
            href={`/workspace/subjects/${topic.subjectId}/topics/${topic.id}`}
          >
            <Button variant={"default"}>
              Open <SquareArrowOutUpRight />
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}
