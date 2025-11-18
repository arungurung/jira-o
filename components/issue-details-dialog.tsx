import { deleteIssue, updateIssue } from '@/actions/issues';
import { Issue, IssuePriority, User } from '@/lib/generated/prisma/client';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';
import { BarLoader } from 'react-spinners';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from './ui/select';
import statuses from '@/data/status.json';
import UserAvatar from './user-avatar';
import MDEditor from '@uiw/react-md-editor';
import { toast } from 'sonner';
import { getQueryClient } from '@/lib/get-query-client';

type IssueType = Issue & {
  reporter: User;
  assignee: User | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  issue: IssueType & {
    reporter: User;
    assignee: User | null;
  };
  borderCol: string;
};

const IssueDetailsDialog = ({ isOpen, onClose, issue, borderCol }: Props) => {
  const [status, setStatus] = React.useState(issue.status);
  const [priority, setPriority] = React.useState(issue.priority);
  const { user } = useUser();
  const { membership } = useOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = getQueryClient();

  const {
    mutate: updateIssueFn,
    isPending: updateLoading,
    error: updateError,
  } = useMutation({
    mutationFn: updateIssue,
    onMutate: async (newIssue, context) => {
      const issuesQueryKey = ['issues', `sprintId:` + issue.sprintId];
      await context.client.cancelQueries({
        queryKey: issuesQueryKey,
      });
      const previousIssues =
        context.client.getQueryData<IssueType[]>(issuesQueryKey);
      context.client.setQueryData<IssueType[]>(issuesQueryKey, (oldIssues) =>
        (oldIssues || []).map((existingIssue) =>
          existingIssue.id === newIssue.issueId
            ? { ...existingIssue, ...newIssue.data }
            : existingIssue
        )
      );
      return { previousIssues };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['issues', `sprintId:` + issue.sprintId],
      });
    },
    onSuccess: () => {
      toast.success('Issue updated successfully');
    },
  });

  const {
    mutate: deleteIssueFn,
    isPending: deleteLoading,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteIssue,
    onSuccess: () => {
      toast.success('Issue deleted successfully');
      onClose();
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ['issues', `sprintId:` + issue.sprintId],
      }),
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      deleteIssueFn(issue.id, {});
    }
  };

  const handlePriorityChange = async (newPriority: IssuePriority) => {
    setPriority(newPriority);
    updateIssueFn({
      issueId: issue.id,
      data: { priority: newPriority, status },
    });
  };

  const handleStatusChange = async (newStatus: typeof issue.status) => {
    setStatus(newStatus);
    updateIssueFn({
      issueId: issue.id,
      data: { status: newStatus, priority },
    });
  };

  const handleGoToProject = () =>
    router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`);

  const canChange =
    user?.id === issue.reporter.clerkUserId || membership?.role === 'org:admin';

  const isProjectPage = !pathname.startsWith('/project/');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-3xl">{issue.title}</DialogTitle>
            {isProjectPage && (
              <Button
                variant="ghost"
                size={'icon'}
                title="Go to Project"
                onClick={handleGoToProject}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {(updateLoading || deleteLoading) && (
          <BarLoader width={'100%'} color={'#36d7b7'} />
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                {statuses.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priority}
              onValueChange={handlePriorityChange}
              disabled={!canChange}
            >
              <SelectTrigger className={`border ${borderCol} rounded`}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>

              <SelectContent>
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-semibold">Description</h4>
            <MDEditor.Markdown
              source={issue.description ? issue.description : '--'}
              className="rounded px-2 py-1"
            />
          </div>

          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Assignee</h4>
              {issue.assignee ? <UserAvatar user={issue.assignee} /> : '--'}
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Reporter</h4>
              <UserAvatar user={issue.reporter} />
            </div>
          </div>

          {canChange && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Issue'}
            </Button>
          )}
          {(updateError || deleteError) && (
            <p className="text-red-500">
              {(updateError || deleteError)?.message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailsDialog;
