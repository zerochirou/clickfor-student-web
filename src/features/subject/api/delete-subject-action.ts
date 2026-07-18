"use server";

import { Subject } from "@/types/subject";
import { Response } from "@/types/response";
import { authCheck } from "@/lib/auth-check";
import { getCookieHeader } from "@/lib/get-cookie";
  
export async function deleteSubjectAction(id: string) {
  await authCheck();
  const cookieHeader = await getCookieHeader();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/subject/${id}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
    },
  );

  const result: Response<Subject> = await response.json();
  return result;
}
