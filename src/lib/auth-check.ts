import { redirect } from 'next/navigation';
import { getSession } from './auth-get-session';

export async function authCheck() {
  const session = await getSession();
  if (!session || !session?.data?.user) {
    redirect('/login');
  }
}
