import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  enrollment: z.string().min(6, 'Valid GTU enrollment number required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branch: z.string().default('CE'),
  semester: z.number().int().min(1).max(8).default(5),
  role: z.enum(['STUDENT', 'FACULTY', 'ADMIN']).default('STUDENT'),
});

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateBookSchema = z.object({
  title: z.string().min(2, 'Book title is required'),
  author: z.string().min(2, 'Author name is required'),
  branch: z.string().default('CE'),
  semester: z.number().int().min(1).max(8).default(5),
  price: z.number().min(0).default(0),
  mode: z.enum(['SELL', 'EXCHANGE', 'DONATE']).default('SELL'),
  condition: z.string().default('Good'),
  edition: z.string().default('Latest Edition'),
});
