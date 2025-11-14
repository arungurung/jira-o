'use server';

import db from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function createProject(data: {
  name: string;
  key: string;
  description: string;
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
