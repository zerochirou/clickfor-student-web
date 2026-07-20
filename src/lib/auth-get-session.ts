import { authClient } from './auth-client';
import { headers } from 'next/headers';

export async function getSession() {
  return await authClient.getSession({
    fetchOptions: {
      credentials: 'include',
      headers: await headers(),
    },
  });
}