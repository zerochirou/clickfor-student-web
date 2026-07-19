"use server";

import { Topic } from "@/types/topic";
import { Response } from "@/types/response";
import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";

export async function getTopicNoteAction(id: string) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/topic/${id}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
    },
  );

  const result: Response<Topic> = await response.json();
  console.log(result);

  return result.data.content;
}
