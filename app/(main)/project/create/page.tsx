'use client';

import OrgSwitcher from '@/components/org-switcher';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createProject } from '@/actions/projects';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarLoader } from 'react-spinners';
import { useMutation } from '@tanstack/react-query';

const CreateProjectPage = () => {
  const { isLoaded: isOrgLoaded, membership } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (isOrgLoaded && isUserLoaded && membership) {
      setIsAdmin(membership?.role === 'org:admin');
    }
  }, [isOrgLoaded, isUserLoaded, membership]);

  const {
    data: project,
    isPending,
    error,
    mutate: createProjectFn,
  } = useMutation({
    mutationFn: createProject,
  });

  useEffect(() => {
    if (project) {
      toast.success('Project created successfully!');
      router.push(`/project/${project.id}`);
    }
  }, [isPending]);

  if (!isOrgLoaded || !isUserLoaded) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <span className="text-2xl gradient-title">
          You do not have permission to create a project.
        </span>
        <OrgSwitcher />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="gradient-title text-6xl text-center font-bold mb-8">
        Create New Project
      </h1>

      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(async (data) => createProjectFn(data))}
      >
        <div>
          <Input
            id="name"
            className="bg-slate-950"
            placeholder="Project Name"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Input
            id="key"
            className="bg-slate-950"
            placeholder="Project Key (e.g., PROJ)"
            {...register('key')}
          />
          {errors.key && (
            <p className="text-red-500 text-sm mt-2">{errors.key.message}</p>
          )}
        </div>

        <div>
          <Textarea
            id="description"
            className="bg-slate-950 h-28"
            placeholder="Project Description"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-2">
              {errors.description.message}
            </p>
          )}
        </div>

        {isPending && (
          <BarLoader className="mb-4" width={'100%'} color="#36d7b7" />
        )}

        <Button
          type="submit"
          disabled={isPending}
          size={'lg'}
          className="bg-blue-500 text-white"
        >
          {isPending ? 'Creating...' : 'Create Project'}
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
      </form>
    </div>
  );
};

export default CreateProjectPage;
