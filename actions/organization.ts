'use server';

import db from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function getOrganization(slug: string) {
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

  const organization = await (
    await clerkClient()
  ).organizations.getOrganization({ slug });

  if (!organization) {
    throw new Error('Organization not found');
  }

  const { data: membership } = await (
    await clerkClient()
  ).organizations.getOrganizationMembershipList({
    organizationId: organization.id,
  });

  const userMembership = membership.find(
    (m) => m.publicUserData?.userId === userId
  );

  if (!userMembership) {
    return null;
  }

  return organization;
}
