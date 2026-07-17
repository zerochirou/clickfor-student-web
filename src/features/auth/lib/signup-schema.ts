import * as v from 'valibot';

export const SignupSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.minLength(2, 'Name must be at least 2 characters.'),
      v.maxLength(50, 'Name must be at most 50 characters.'),
    ),
    email: v.pipe(
      v.string(),
      v.trim(),
      v.email('Invalid email format.'),
      v.minLength(5, 'Email must be at least 5 characters.'),
      v.maxLength(32, 'Email must be at most 32 characters.'),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, 'Password must be at least 8 characters.'),
      v.maxLength(100, 'Password must be at most 100 characters.'),
    ),
    confirmPassword: v.string(),
  }),
  v.forward(
    v.check((input) => input.password === input.confirmPassword, 'Passwords do not match.'),
    ['confirmPassword'],
  ),
);
