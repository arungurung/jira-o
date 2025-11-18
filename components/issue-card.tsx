'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Issue, User } from '@/lib/generated/prisma/client';
import { Badge } from './ui/badge';
import UserAvatar from './user-avatar';
import { formatDistanceToNow } from 'date-fns';
import IssueDetailsDialog from './issue-details-dialog';

const priorityColor = {
  LOW: 'border-green-600',
  MEDIUM: 'border-yellow-300',
  HIGH: 'border-orange-400',
  URGENT: 'border-red-400',
};

type IssueCardProps = {
  issue: Issue & {
    assignee: User | null;
    reporter: User;
  };
  showStatus?: boolean;
};

const IssueCard = ({ issue, showStatus = false }: IssueCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <Card
        onClick={() => setIsDialogOpen(true)}
        className="cursor-pointer hover:shadow-md transition-shadow pt-0"
      >
        <CardHeader
          className={`border-t-2 ${
            priorityColor[issue.priority]
          } rounded-lg pt-4`}
        >
          <CardTitle>{issue.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex -mt-3 gap-2">
          {showStatus && <Badge>{issue.status}</Badge>}
          <Badge variant="outline" className="-ml-1">
            {issue.priority}
          </Badge>
        </CardContent>

        <CardFooter className="flex flex-col items-start space-y-3">
          {issue.assignee ? <UserAvatar user={issue.assignee} /> : '--'}

          <div className="text-xs text-gray-400 w-full">Created {created}</div>
        </CardFooter>
      </Card>

      {isDialogOpen && (
        <IssueDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          issue={issue}
          borderCol={priorityColor[issue.priority]}
        />
      )}
    </>
  );
};

export default IssueCard;
