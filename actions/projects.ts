'use server';

import db from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function createProject(data: {
  name: string;
  key: string;
  description?: string;
}) {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (!orgId) {
    throw new Error('Organization ID is required to create a project');
  }

  const { data: membership } = await (
    await clerkClient()
  ).organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  const userMembership = membership.find(
    (m) => m.publicUserData?.userId === userId
  );

  if (!userMembership || userMembership.role !== 'org:admin') {
    throw new Error('Only organization admins can create projects');
  }

  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error) {
    throw new Error(
      'Failed to create project: ' +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

export async function getProjects(orgId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const projects = await db.project.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects;
}

export async function deleteProject(projectId: string) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  if (orgRole !== 'org:admin') {
    throw new Error('Only organization admins can delete projects');
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error(
      'Project not found or does not belong to your organization'
    );
  }

  await db.project.delete({
    where: {
      id: projectId,
    },
  });

  return { success: true };
}

export async function getProjectById(projectId: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      sprints: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  if (project.organizationId !== orgId) {
    throw new Error('Project does not belong to your organization');
  }

  return project;
}
