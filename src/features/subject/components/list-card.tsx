"use client";

import { Subject } from "@/types/subject";
import { SubjectCard } from "./subject-card";

export function ListCard({ subjects }: { subjects: Subject[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4">
      {subjects.map((item) => {
        return <SubjectCard key={item.id} subject={item}/>
      })}
    </ul>
  );
}
