"use server";

import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Task } from "@/types/task";


export async function deleteTaskAction(taskId: string) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task/${taskId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
    },
  );

  return await response.json() as Response<Task>;
}
