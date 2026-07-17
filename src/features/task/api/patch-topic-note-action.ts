"use server";

import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Topic } from "@/types/topic";
import { Block } from "@blocknote/core";

export async function patchTopicNoteAction(id: string, content: Block[]) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const formData = new FormData();

  formData.append("content", JSON.stringify(content));
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/topic/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
      body: formData,
    },
  );
  const data: Response<Topic> = await response.json();
  return data;
}
