"use server";

import { Subject } from "@/types/subject";
import { Response } from "@/types/response";
import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
import { CreateSubjectDTO } from "../lib/create-subject-schema";

export async function postSubjectAction(data: CreateSubjectDTO) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const formData = new FormData();

  formData.append("name", data.name);

  if (data.teacher) formData.append("teacher", data.teacher);
  if (data.description) formData.append("description", data.description);
  if (data.minAverageScore)
    formData.append("minAverageScore", data.minAverageScore.toString());
  if (data.image) formData.append("image", data.image);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/subject`,
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
