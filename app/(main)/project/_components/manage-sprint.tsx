'use client';

import { updateSprintStatus } from '@/actions/sprints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sprint } from '@/lib/generated/prisma/client';
import { useMutation } from '@tanstack/react-query';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';

type SprintManagerProps = {
  sprint: Sprint;
  setSprint: (sprint: Sprint) => void;
  sprints: Sprint[];
  projectId: string;
};

const SprintManager = ({
  sprint,
  setSprint,
  sprints,
  projectId,
}: SprintManagerProps) => {
  const [status, setStatus] = useState(sprint.status);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: updateSprintStatus,
    onSuccess: (data) => {
      if (data.sprint && data.success) {
        setStatus(data.sprint.status);
        setSprint({
          ...sprint,
          status: data.sprint.status,
        });
      }
    },
  });

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const now = new Date();

  const canStart =
    isBefore(now, endDate) && isAfter(now, startDate) && status === 'PLANNED';

  const canEnd = status === 'ACTIVE';

  const handleSprintChange = (id: string) => {
    const selectedSprint = sprints.find((s) => s.id === id);
    setSprint(selectedSprint!);
    setStatus(selectedSprint!.status);
    router.replace(`/project/${projectId}`);
  };

  const getStatusText = () => {
    if (status === 'COMPLETED') {
      return `Sprint Ended`;
    }
    if (status === 'ACTIVE' && isAfter(now, endDate)) {
      return `Overdue by ${formatDistanceToNow(endDate)}`;
    }
    if (status === 'PLANNED' && isBefore(now, startDate)) {
      return `Starts in ${formatDistanceToNow(startDate)}`;
    }
    return null;
  };

  useEffect(() => {
    const sprintId = searchParams.get('sprint');
    if (sprintId && sprintId !== sprint.id) {
      const selectedSprint = sprints.find((s) => s.id === sprintId);
      if (selectedSprint) {
        setSprint(selectedSprint);
        setStatus(selectedSprint.status);
      }
    }
  }, [sprints, searchParams]);

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <Select value={sprint.id} onValueChange={handleSprintChange}>
          <SelectTrigger className="bg-slate-950 self-start">
            <SelectValue placeholder={'Select Sprint'} />
          </SelectTrigger>

          <SelectContent>
            {sprints.map((sp) => (
              <SelectItem key={sp.id} value={sp.id}>
                {sp.name} ({format(sp.startDate, 'MMM d, yyyy')} to{' '}
                {format(sp.endDate, 'MMM d, yyyy')})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canStart && (
          <Button
            disabled={isUpdating}
            onClick={() =>
              updateStatus({ sprintId: sprint.id, newStatus: 'ACTIVE' })
            }
            className="bg-green-900 text-white"
          >
            Start Sprint
          </Button>
        )}
        {canEnd && (
          <Button
            disabled={isUpdating}
            onClick={() =>
              updateStatus({ sprintId: sprint.id, newStatus: 'COMPLETED' })
            }
            variant={'destructive'}
          >
            End Sprint
          </Button>
        )}
      </div>

      {isUpdating && (
        <BarLoader className="mt-2" width={'100%'} color={'#36d7b7'} />
      )}
      {getStatusText() && (
        <Badge variant={'default'} className="mt-3 ml-1 self-start">
          {getStatusText()}
        </Badge>
      )}
    </>
  );
};

export default SprintManager;
