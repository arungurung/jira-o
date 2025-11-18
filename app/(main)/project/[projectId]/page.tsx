import { getProjectById } from '@/actions/projects';
import SprintCreationForm from '../_components/sprint-creation-form';
import { notFound } from 'next/navigation';
import SprintBoard from '../_components/sprint-board';

const ProjectPage = async ({ params }: { params: { projectId: string } }) => {
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto container">
      {/* sprint creation */}
      <SprintCreationForm
        projectTitle={project.name}
        projectId={projectId}
        projectKey={project.key}
        sprintKey={project.sprints?.length + 1}
      />

      {/* sprint board */}
      {project.sprints.length > 0 ? (
        <SprintBoard
          sprints={project.sprints}
          projectId={projectId}
          orgId={project.organizationId}
        />
      ) : (
        <div>No sprints found. Create a sprint to get started!</div>
      )}
    </div>
  );
};

export default ProjectPage;
