import { cookies } from 'next/headers';
import { authClient } from './auth-client';

export async function getSession() {
  const headers = await cookies();
  return await authClient.getSession({
    fetchOptions: {
      credentials: 'include',
      headers: headers,
    },
  });
}
