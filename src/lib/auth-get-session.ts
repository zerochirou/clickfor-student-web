import { cookies } from 'next/headers';
import { authClient } from './auth-client';

export async function getSession() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  return await authClient.getSession({
    fetchOptions: {
      credentials: 'include',
      headers: {
        Cookie: cookieString,
      },
    },
  });
}
