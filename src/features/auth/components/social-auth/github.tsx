'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image';

export function GithubAuth() {
  const signIn = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: 'http://localhost:3000/workspace',
    });
  };
  return (
    <Button variant="outline" type="button" onClick={signIn}>
      <Image src={'/images/brand/github.svg'} alt="Facebook" width={15} height={15} />
      <span>GitHub</span>
    </Button>
  );
}
