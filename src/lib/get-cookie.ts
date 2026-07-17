'use server';

import { headers } from 'next/headers';

export async function getCookieHeader(name: string = 'cookie') {
  const headerStore = await headers();
  return headerStore.get(name) || '';
}
