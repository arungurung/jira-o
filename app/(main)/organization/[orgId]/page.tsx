import { getOrganization } from '@/actions/organization';
import OrgSwitcher from '@/components/org-switcher';
import ProjectList from './_components/project-list';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import UserIssues from './_components/user-issues';

const Organization = async ({ params }: { params: { orgId: string } }) => {
  const { orgId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const organization = await getOrganization(orgId);

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
        <h1 className="font-bold gradient-title pb-2 text-5xl">
          {organization.name}'s Projects
        </h1>

        <OrgSwitcher />
      </div>

      <div className="mb-4">
        <ProjectList orgId={organization.id} />
      </div>

      <div className="mt-8">
        <UserIssues userId={userId} />
      </div>
    </div>
  );
};

export default Organization;
