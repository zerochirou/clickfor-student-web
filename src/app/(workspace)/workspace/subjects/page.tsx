import { Button } from "@/components/ui/button";
import { EmptySubject } from "@/features/subject/components/empty-subject";
import { ListCard } from "@/features/subject/components/list-card";
import { SubjectFrame } from "@/features/subject/components/subject-frame";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Subject } from "@/types/subject";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function SubjectsPage() {
  const cookieHeader = await getCookieHeader();
  const loadSubjects = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/subject`,
      {
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Subject[]> = await response.json();
    return data;
  };

  const { data } = await loadSubjects();

  return (
    <SubjectFrame>
      <Suspense fallback={<>Loading...</>}>
        {data.length > 0 ? (
          <div className="flex flex-col gap-4">
            <Link href={"/workspace/subjects/create"}>
              <Button>
                Create Subject <Plus />
              </Button>
            </Link>
            <ListCard subjects={data} />
          </div>
        ) : (
          <>
            <EmptySubject />
          </>
        )}
      </Suspense>
    </SubjectFrame>
  );
}
