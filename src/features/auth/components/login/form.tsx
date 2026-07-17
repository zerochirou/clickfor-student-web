'use client';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Form, Field as FormischField, reset, useForm } from '@formisch/react';
import type { SubmitHandler } from '@formisch/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { LoginSchema } from '@/features/auth/lib/login-schema';
import Image from 'next/image';
import { GithubAuth } from '../social-auth/github';
import { GoogleAuth } from '../social-auth/google';
import { ArrowRight, Eye, EyeClosed } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const form = useForm({
    schema: LoginSchema,
    initialInput: {
      email: '',
      password: '',
    },
  });

  const handleSubmit: SubmitHandler<typeof LoginSchema> = async (output) => {
    await authClient.signIn.email(
      {
        email: output.email,
        password: output.password,
      },
      {
        onRequest: () => {
          setLoading(true);
          setServerErrors({});
          toast.loading('Signing in...');
        },
        onSuccess: () => {
          setLoading(false);
          toast.success('Login successful');
          router.push('/workspace');
          reset(form);
        },
        // @ts-nocheck
        onError: (ctx) => {
          setLoading(false);
          const message = ctx.error.message;
          setServerErrors({});
          if (message.toLowerCase().includes('email')) {
            setServerErrors({ email: message });
          } else if (message.toLowerCase().includes('password')) {
            setServerErrors({ password: message });
          } else {
            setServerErrors({ general: message });
          }
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className="w-full sm:max-w-md mx-auto space-y-6">
      {/* HEADER */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

      <Form of={form} id="login-form" onSubmit={handleSubmit}>
        <FieldGroup className="space-y-4">
          {/* EMAIL */}
          <FormischField of={form} path={['email']}>
            {(field) => (
              <Field data-invalid={field.errors !== null || !!serverErrors.email}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>

                <Input
                  {...field.props}
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={field.input ?? ''}
                  aria-invalid={field.errors !== null || !!serverErrors.email}
                />

                {field.errors && <FieldError errors={field.errors.map((m) => ({ message: m }))} />}

                {serverErrors.email && <FieldError errors={[{ message: serverErrors.email }]} />}
              </Field>
            )}
          </FormischField>

          {/* PASSWORD */}
          <FormischField of={form} path={['password']}>
            {(field) => (
              <Field data-invalid={field.errors !== null || !!serverErrors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>

                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    {...field.props}
                    id="login-password"
                    type={isShow ? 'text' : 'password'}
                    value={field.input ?? ''}
                    aria-invalid={field.errors !== null || !!serverErrors.password}
                  />

                  <Button type="button" variant="outline" onClick={() => setIsShow(!isShow)}>
                    {isShow ? <EyeClosed size={20} /> : <Eye size={20} />}
                  </Button>
                </div>

                {field.errors && <FieldError errors={field.errors.map((m) => ({ message: m }))} />}

                {serverErrors.password && (
                  <FieldError errors={[{ message: serverErrors.password }]} />
                )}
              </Field>
            )}
          </FormischField>

          {/* GENERAL ERROR */}
          {serverErrors.general && (
            <div className="text-sm text-red-500 text-center">{serverErrors.general}</div>
          )}

          {/* SUBMIT */}
          <Button type="submit" form="login-form" className="w-full">
            {loading ? (
              <Spinner />
            ) : (
              <>
                Login
                  <ArrowRight />
              </>
            )}
          </Button>
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field>
            <div className="flex items-center gap-3 w-full justify-center">
              {/* GITHUB */}
              <GithubAuth />

              {/* GOOGLE */}
              <GoogleAuth />

              {/* FACEBOOK */}
              <Button variant="outline" type="button">
                <Image src={'/images/brand/meta.svg'} alt="Facebook" width={15} height={15} />
                <span>Meta</span>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </Form>

      {/* FOOTER */}
      <FieldDescription className="text-center">
        Don`&apos;t have an account?{' '}
        <Link href="/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </FieldDescription>
    </div>
  );
}
