import { Span } from 'next/dist/trace';
import React, { Suspense } from 'react';
import { BarLoader } from 'react-spinners';

const ProjectDetailLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mx-auto">
      <Suspense fallback={<span>Loading project...</span>}>{children}</Suspense>
    </div>
  );
};

export default ProjectDetailLayout;
