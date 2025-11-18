'use client';

import { createIssue } from '@/actions/issues';
import { getOrganizationUsers } from '@/actions/organization';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IssueStatus, SprintStatus } from '@/lib/generated/prisma/enums';
import { getQueryClient } from '@/lib/get-query-client';
import { issueSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import { Controller, useForm } from 'react-hook-form';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';

type IssueCreationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
  projectId: string;
  orgId: string;
  status: IssueStatus;
};

const IssueCreationDrawer = ({
  isOpen,
  onClose,
  orgId,
  projectId,
  sprintId,
  status,
}: IssueCreationDrawerProps) => {
  const queryClient = getQueryClient();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: 'MEDIUM',
      description: '',
      assigneeId: '',
    },
  });

  const {
    mutate: createIssueFn,
    isPending: isCreatingIssue,
    error: issueCreationError,
    data: newIssue,
  } = useMutation({
    mutationFn: createIssue,
    onSettled: () => {
      reset();
      queryClient.invalidateQueries({
        queryKey: ['issues', `sprintId:` + sprintId],
      });
      onClose();
    },
    onSuccess: () => {
      toast.success('Issue created successfully');
    },
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users', orgId],
    queryFn: () => getOrganizationUsers(orgId),
    enabled: !!orgId,
  });

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Issue</DrawerTitle>
        </DrawerHeader>

        {isUsersLoading && <BarLoader width={'100%'} color="#36d7b7" />}

        <form
          onSubmit={handleSubmit(async (data) =>
            createIssueFn({
              projectId,
              data: {
                ...data,
                description: data.description || null,
                status,
                sprintId,
              },
            })
          )}
          className="p-4 space-y-4"
        >
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="assigneeId"
              className="block text-sm font-medium mb-1"
            >
              Assignee
            </label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assigneeId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.assigneeId.message}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="description"
            >
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MDEditor value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium mb-1"
            >
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {issueCreationError && (
            <p className="text-red-500 text-sm mt-1">
              {issueCreationError.message}
            </p>
          )}
          <Button type="submit" disabled={isCreatingIssue} className="w-full">
            {isCreatingIssue ? 'Creating...' : 'Create Issue'}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default IssueCreationDrawer;
