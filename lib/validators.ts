import { date, z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be at most 100 characters'),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be at most 10 characters'),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
});

export const sprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required'),
  startDate: z.date(),
  endDate: z.date(),
});

export const issueSchema = z.object({
  title: z.string().min(1, 'Issue title is required'),
  assigneeId: z.string().cuid('Please select assignee'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});
