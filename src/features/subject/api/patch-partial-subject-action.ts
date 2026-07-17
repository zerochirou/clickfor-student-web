"use server";

import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Subject } from "@/types/subject";

export async function patchPartialSubjectNoteAction(id: string, formData: FormData) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/subject/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
      body: formData,
    },
  );
  const data: Response<Subject> = await response.json();
  return data;
}
