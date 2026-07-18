import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Subject } from "@/types/subject";
import { ListTree, TextAlignStart } from "lucide-react";
import { Topic } from "@/types/topic";
import { SubjectProvider } from "@/features/subject/lib/subject-provider";
import { SubjectFramePage } from "@/features/subject/components/subject-frame-page";
import { SubjectTabs } from "@/features/subject/components/subject-tabs";
import { SubjectNoteEditor } from "@/features/subject/components/subject-note-editor";
import { TopicList } from "@/features/topic/components/topic-list";
import { SubjectHeader } from "@/features/subject/components/subject-header";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loadSubjectById = async (id: string) => {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/subject/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Subject> = await response.json();
    return data;
  };
  const loadTopics = async (id: string) => {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/topic/subject/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Topic[]> = await response.json();
    return data;
  };

  const [subject, topics] = await Promise.all([
    loadSubjectById(id),
    loadTopics(id),
  ]);

  return (
    <SubjectProvider initialData={subject.data}>
      <SubjectFramePage>
        <section className="mx-auto max-w-3xl">
          <SubjectHeader data={subject.data} />
        </section>
        <SubjectTabs
          components={[
            {
              title: (
                <span className="flex flex-row items-center gap-2">
                  <TextAlignStart /> Note
                </span>
              ),
              content: (
                <SubjectNoteEditor
                  id={id}
                  initialContent={subject.data.content!}
                />
              ),
            },
            {
              title: (
                <span className="flex flex-row items-center gap-2">
                  <ListTree />
                  Subtrack
                </span>
              ),
              content: <TopicList id={id} topics={topics.data} />,
            },
            // {
            //   title: (
            //     <span className="flex flex-row items-center gap-2">
            //       <Route /> Learning Path
            //     </span>
            //   ),
            //   content: <TopicPath />,
            // },
          ]}
        />
      </SubjectFramePage>
    </SubjectProvider>
  );
}
