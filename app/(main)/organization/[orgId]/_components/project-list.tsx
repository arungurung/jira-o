import { getProjects } from '@/actions/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import DeleteProject from './delete-project';

const ProjectList = async ({ orgId }: { orgId: string }) => {
  const projects = await getProjects(orgId);

  if (projects.length === 0) {
    return (
      <p>
        No projects found.
        <Link
          href={`/project/create`}
          className="text-blue-200 underline underline-offset-2"
        >
          Create New
        </Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {project.name}
              <DeleteProject projectId={project.id} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">{project.description}</p>
            <Link
              href={`/project/${project.id}`}
              className="text-blue-500 hover:underline"
            >
              View Project
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectList;
