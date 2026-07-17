'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image';

export function GoogleAuth() {
  const signIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: 'http://localhost:3000/workspace',
    });
  };
  return (
    <Button variant="outline" type="button" onClick={signIn}>
      <Image src={'/images/brand/google.svg'} alt="Google" width={15} height={15} />
      <span>Google</span>
    </Button>
  );
}
