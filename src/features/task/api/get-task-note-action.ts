"use server";

import { Task } from "@/types/task";
import { Response } from "@/types/response";
import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";

export async function getTaskNoteAction(id: string) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task/${id}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
    },
  );

  const result: Response<Task> = await response.json();
  console.log(result);

  return result.data.content;
}
