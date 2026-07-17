"use server";

import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Task } from "@/types/task";

export async function patchPartialTaskNoteAction(id: string, formData: FormData) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
      body: formData,
    },
  );
  const data: Response<Task> = await response.json();
  return data;
}
