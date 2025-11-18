'use server';

import { Issue } from '@/lib/generated/prisma/client';
import db from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function createIssue({
  projectId,
  data,
}: {
  projectId: string;
  data: Pick<
    Issue,
    'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'sprintId'
  >;
}) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const lastIssue = await db.issue.findFirst({
    where: { projectId, status: data.status },
    orderBy: { createdAt: 'desc' },
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      sprintId: data.sprintId,
      projectId,
      reporterId: user.id,
      assigneeId: data.assigneeId || null,
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}

export async function getIssuesForSprint(sprintId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const issues = await db.issue.findMany({
    where: { sprintId },
    orderBy: [
      {
        createdAt: 'asc',
      },
      { order: 'asc' },
    ],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

export async function updateIssue({
  issueId,
  data,
}: {
  issueId: string;
  data: Partial<Issue>;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  try {
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: {
        project: true,
      },
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return updatedIssue;
  } catch (error) {
    throw new Error('Failed to update issue: ' + (error as Error).message);
  }
}

export async function updateIssueOrder(updatedIssues: Issue[]) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  await db.$transaction(async (prisma) => {
    for (const issue of updatedIssues) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: { order: issue.order, status: issue.status },
      });
    }
  });

  return { success: true };
}

export async function deleteIssue(issueId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: {
      project: true,
    },
  });

  if (!issue) {
    throw new Error('Issue not found');
  }

  if (issue.reporterId !== user.id) {
    throw new Error('You do not have permission to delete this issue');
  }

  await db.issue.delete({
    where: { id: issueId },
  });

  return { success: true };
}

export async function getUserIssues(userId: string) {
  const { orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const issues = await db.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: {
        organizationId: orgId,
      },
    },
    include: {
      assignee: true,
      reporter: true,
      project: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return issues;
}
