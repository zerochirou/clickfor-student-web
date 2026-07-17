"use server";

import { Subject } from "@/types/subject";
import { Response } from "@/types/response";
import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
import { CreateTopicDTO } from "../../workspace/lib/create-topic-schema";

export async function postTopicAction(data: CreateTopicDTO, subjectId: string) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("subjectId", subjectId);
  if (data.minAverageScore)
    formData.append("minAverageScore", data.minAverageScore.toString());
  if (data.description) formData.append("description", data.description);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/topic/subject/${subjectId}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
      body: formData,
    },
  );

  const result: Response<Subject> = await response.json();
  console.log(result);
  return result;
}
