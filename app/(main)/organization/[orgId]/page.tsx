import { getOrganization } from '@/actions/organization';
import OrgSwitcher from '@/components/org-switcher';

const Organization = async ({ params }: { params: { orgId: string } }) => {
  const { orgId } = await params;
  const organization = await getOrganization(orgId);

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
        <h1 className="font-bold gradient-title pb-2 text-5xl">
          {organization.name}'s Projects
        </h1>

        <OrgSwitcher />
      </div>

      <div className="mb-4">Show org projects</div>

      <div className="mt-8">Show user assigned and reported issues here</div>
    </div>
  );
};

export default Organization;
