import { SubjectPieChart } from "@/features/workspace/components/chart/pie-chart";
import { SubjectRadarChart } from "@/features/workspace/components/chart/radar-chart";
import { SubjectRankBarChart } from "@/features/workspace/components/chart/subject-rank";
import { TaskStatusRadialChart } from "@/features/workspace/components/chart/task-status-chart";
import { columns } from "@/features/workspace/components/table/columns";
import { DataTable } from "@/features/workspace/components/table/data-table";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Subject } from "@/types/subject";
import { Task } from "@/types/task";
import { Topic } from "@/types/topic";

export default async function WorkspacePage() {
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
  const loadTopics = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/topic`,
      {
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Topic[]> = await response.json();
    return data;
  };
  const loadTask = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task`,
      {
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Task[]> = await response.json();
    return data;
  };
  const [subjects, topics, tasks] = await Promise.all([
    loadSubjects(),
    loadTopics(),
    loadTask(),
  ]);
  console.log(tasks);
  return (
    <div>
      {/*<ThemeToggle />*/}
      <div className="container mx-auto mb-10">
        <h1 className="text-2xl font-bold mb-5">Daftar Pelajaran</h1>
        <DataTable columns={columns} data={subjects.data} />
      </div>
      <div className="grid grid-cols-6 gap-4 items-end">
        <div className="col-span-2">
          <SubjectRadarChart subjects={subjects.data} />
        </div>
        <div className="col-span-2">
          <SubjectPieChart subjects={subjects.data} />
        </div>
        <div className="col-span-2">
          <TaskStatusRadialChart tasks={tasks.data} />
        </div>
      </div>
    </div>
  );
}
