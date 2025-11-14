'use client';

import {
  OrganizationSwitcher,
  SignedIn,
  useOrganization,
  useUser,
} from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded || !isUserLoaded) {
    return null;
  }

  return (
    <div>
      <SignedIn>
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl={'/organization/:slug'}
          afterSelectOrganizationUrl={'/organization/:slug'}
          {...(pathname === '/onboarding'
            ? {
                createOrganizationMode: 'navigation',
                createOrganizationUrl: '/onboarding',
              }
            : {
                createOrganizationMode: 'modal',
              })}
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                'border border-gray-300 px-5 py-2 rounded-md',
              organizationSwitcherTriggerIcon: 'text-white',
            },
          }}
        />
      </SignedIn>
    </div>
  );
};

export default OrgSwitcher;
