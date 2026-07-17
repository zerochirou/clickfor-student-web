import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/auth`,
});
