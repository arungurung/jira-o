'use client';

import { deleteProject } from '@/actions/projects';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const DeleteProject = ({ projectId }: { projectId: string }) => {
  const { membership } = useOrganization();
  const router = useRouter();

  const {
    mutate: deleteProjectFn,
    data: deleted,
    isPending: isDeleting,
    error,
  } = useMutation({
    mutationFn: deleteProject,
  });

  const isAdmin = membership?.role === 'org:admin';

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      deleteProjectFn(projectId);
    }
  };

  useEffect(() => {
    if (deleted?.success) {
      toast.success('Project deleted successfully');
      router.refresh();
    }
  }, [deleted]);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Button
        variant={'ghost'}
        className={`${isDeleting ? 'animate-pulse' : ''}`}
        disabled={isDeleting}
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
    </>
  );
};

export default DeleteProject;
