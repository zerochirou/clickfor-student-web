'use client';

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Form, Field as FormischField, reset, useForm } from '@formisch/react';
import { SignupSchema } from '@/features/auth/lib/signup-schema';
import type { SubmitHandler } from '@formisch/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight, Eye, EyeClosed } from 'lucide-react';

import { useRouter } from 'next/navigation';

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const form = useForm({
    schema: SignupSchema,
    initialInput: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit: SubmitHandler<typeof SignupSchema> = async (output) => {
    await authClient.signUp.email(
      {
        email: output.email,
        password: output.password,
        name: output.name,
        callbackURL: '/dashboard',
      },
      {
        onRequest: () => {
          setLoading(true);
          toast.loading('Signing up...');
        },
        onSuccess: () => {
          toast.success('Account created successfully!');
          setLoading(false);
          router.push('/');
        },
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

    reset(form);
  };

  return (
    <div className="w-full sm:max-w-md mx-auto space-y-6">
      {/* HEADER */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details to create a new account.
        </p>
      </div>

      <Form of={form} id="signup-form" onSubmit={handleSubmit}>
        <FieldGroup className="space-y-4">
          {/* NAME */}
          <FormischField of={form} path={['name']}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                <Input
                  {...field.props}
                  id="signup-name"
                  value={field.input ?? ''}
                  placeholder="John Doe"
                  aria-invalid={field.errors !== null}
                />
                {field.errors && <FieldError errors={field.errors.map((m) => ({ message: m }))} />}
              </Field>
            )}
          </FormischField>

          {/* EMAIL */}
          <FormischField of={form} path={['email']}>
            {(field) => (
              <Field data-invalid={field.errors !== null || !!serverErrors.email}>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  {...field.props}
                  id="signup-email"
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
              <Field data-invalid={field.errors !== null}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                  <Link
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    href="/"
                  >
                    Reset Password
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    {...field.props}
                    id="signup-password"
                    type={isShow ? 'password' : 'text'}
                    value={field.input ?? ''}
                    aria-invalid={field.errors !== null}
                  />
                  <Button type="button" variant={'outline'} onClick={() => setIsShow(!isShow)}>
                    {isShow ? <EyeClosed size={32} /> : <Eye size={32} />}
                  </Button>
                </div>

                {field.errors && <FieldError errors={field.errors.map((m) => ({ message: m }))} />}
                {serverErrors.password && (
                  <FieldError errors={[{ message: serverErrors.password }]} />
                )}
              </Field>
            )}
          </FormischField>

          {/* CONFIRM PASSWORD */}
          <FormischField of={form} path={['confirmPassword']}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="signup-confirm">Confirm Password</FieldLabel>
                <Input
                  {...field.props}
                  id="signup-confirm"
                  type="password"
                  value={field.input ?? ''}
                  aria-invalid={field.errors !== null}
                />
                {field.errors && <FieldError errors={field.errors.map((m) => ({ message: m }))} />}
              </Field>
            )}
          </FormischField>
          {serverErrors.general && (
            <div className="text-sm text-red-500 text-center">{serverErrors.general}</div>
          )}

          {/* SUBMIT */}
          <Button type="submit" form="signup-form" className="w-full">
            {loading ? (
              <Spinner />
            ) : (
              <>
                Create Account
                <ArrowRight size={32} />
              </>
            )}
          </Button>
        </FieldGroup>
      </Form>

      {/* FOOTER */}
      <FieldDescription className="text-center">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </FieldDescription>
    </div>
  );
}
