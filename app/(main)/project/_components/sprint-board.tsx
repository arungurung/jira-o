'use client';

import {
  Issue,
  IssueStatus,
  Sprint,
  User,
} from '@/lib/generated/prisma/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import IssueCreationDrawer from './create-issue';
import { getIssuesForSprint, updateIssueOrder } from '@/actions/issues';
import IssueCard from '@/components/issue-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BarLoader } from 'react-spinners';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { reorderList } from '@/lib/utils';
import statuses from '@/data/status.json';
import BoardFilters from './board-filters';
import SprintManager from './manage-sprint';

type SprintBoardProps = {
  sprints: Sprint[];
  projectId: string;
  orgId: string;
};

const SprintBoard = ({ sprints, projectId, orgId }: SprintBoardProps) => {
  const [currentSprint, setCurrentSprint] = React.useState<Sprint>(
    sprints?.find((sprint) => sprint.status === 'ACTIVE') || sprints[0]
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] =
    React.useState<IssueStatus>('TODO');

  const [filteredIssues, setFilteredIssues] = React.useState<
    (Issue & { assignee: User | null } & { reporter: User })[]
  >([]);

  const {
    data: issues,
    isLoading: isIssuesLoading,
    error: issuesError,
  } = useQuery({
    queryKey: ['issues', `sprintId:` + currentSprint.id],
    queryFn: () => getIssuesForSprint(currentSprint.id),
    enabled: !!currentSprint.id,
    select(data) {
      if (data) {
        setFilteredIssues(data);
      }
      return data;
    },
  });

  const {
    mutate: updateIssueOrderFn,
    isPending: updateLoading,
    error: updateError,
  } = useMutation({
    mutationFn: updateIssueOrder,
  });

  const onDragEnd = async (result: DropResult) => {
    if (currentSprint.status === 'PLANNED') {
      toast.warning('Start the sprint to update board.');
      return;
    }
    if (currentSprint.status === 'COMPLETED') {
      toast.warning('Cannot update issues in a completed sprint.');
      return;
    }

    const { destination, source } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newOrderedData = [...(issues || [])];
    const sourceList = newOrderedData.filter(
      (issue) => issue.status === source.droppableId
    );
    const destinationList = newOrderedData.filter(
      (issue) => issue.status === destination.droppableId
    );

    if (source.droppableId === destination.droppableId) {
      const reorderedCards = reorderList(
        sourceList,
        source.index,
        destination.index
      );

      reorderedCards.forEach((issue, index) => {
        issue.order = index;
      });
    } else {
      const [movedCard] = sourceList.splice(source.index, 1);
      movedCard.status = destination.droppableId as IssueStatus;
      destinationList.splice(destination.index, 0, movedCard);

      sourceList.forEach((issue, index) => {
        issue.order = index;
      });
      destinationList.forEach((issue, index) => {
        issue.order = index;
      });
    }

    const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
    updateIssueOrderFn(sortedIssues);
  };

  if (issuesError) {
    return <div>Error loading issues: {issuesError.message}</div>;
  }

  return (
    <div className="flex flex-col">
      <SprintManager
        sprint={currentSprint}
        setSprint={setCurrentSprint}
        sprints={sprints}
        projectId={projectId}
      />

      {issues && !isIssuesLoading && (
        <BoardFilters issues={issues} onFilterChange={setFilteredIssues} />
      )}

      {updateError && (
        <div className="text-red-500 mt-2">{updateError.message}</div>
      )}

      {(isIssuesLoading || updateLoading) && (
        <BarLoader width={'100%'} color="#36d7b7" className="mt-4" />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
          {statuses.map((status) => (
            <Droppable key={status.key} droppableId={status.key}>
              {(provided) => (
                <div
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h3 className="font-semibold mb-2 text-center">
                    {status.name}
                  </h3>

                  {filteredIssues
                    ?.filter((issue) => issue.status === status.key)
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        index={index}
                        isDragDisabled={updateLoading}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <IssueCard issue={issue} />
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}

                  {status.key === 'TODO' &&
                    currentSprint.status !== 'COMPLETED' && (
                      <Button
                        variant={'ghost'}
                        className="w-full"
                        onClick={() => {
                          setSelectedStatus(status.key as IssueStatus);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Create Issue
                      </Button>
                    )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currentSprint.id}
        projectId={projectId}
        orgId={orgId}
        status={selectedStatus}
      />
    </div>
  );
};

export default SprintBoard;
