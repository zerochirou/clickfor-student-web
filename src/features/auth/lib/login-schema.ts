import * as v from 'valibot';

export const LoginSchema = v.pipe(
  v.object({
    email: v.pipe(v.string(), v.trim(), v.email('Invalid email format.')),
    password: v.pipe(v.string()),
  }),
);
