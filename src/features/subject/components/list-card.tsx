import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Subject } from "@/types/subject";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

export function ListCard({ subjects }: { subjects: Subject[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4">
      {subjects.map((item) => {
        return (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
              <div>
                <Link prefetch href={`/workspace/subjects/${item.id}`}>
                  <Button variant={'outline'}>
                    Open <SquareArrowOutUpRight />
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </ul>
  );
}
