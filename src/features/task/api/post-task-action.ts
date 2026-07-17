"use server";

import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
import { CreateTaskDTO } from "../lib/create-task-schema";
import { Response } from "@/types/response";
import { Task } from "@/types/task";

export async function postTaskAction(data: CreateTaskDTO, topicId: string) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("topicId", topicId);
  formData.append("description", data.description ?? "");
  formData.append("minAverageScore", data.minAverageScore?.toString() ?? "");
  formData.append("dueDate", data.dueDate ?? "");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task/topic/${topicId}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
      body: formData,
    },
  );

  return (await response.json()) as Response<Task>;
}
