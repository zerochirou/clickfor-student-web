import { Toaster } from '@/components/ui/sonner';
import { AuthFrame } from '@/features/auth';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthFrame>
      <Toaster />
      {children}
    </AuthFrame>
  );
}
