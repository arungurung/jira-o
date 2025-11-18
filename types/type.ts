import { Issue, User } from '@/lib/generated/prisma/client';

export type IssueWithUsers = Issue & {
  assignee: User | null;
  reporter: User;
};
