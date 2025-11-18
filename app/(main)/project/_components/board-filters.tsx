import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Issue, User } from '@/lib/generated/prisma/client';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';

type IssueType = Issue & { assignee: User | null } & { reporter: User };

type Props = {
  issues: IssueType[];
  onFilterChange: (issues: IssueType[]) => void;
};

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const BoardFilters = ({ issues, onFilterChange }: Props) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = React.useState<
    string[]
  >([]);
  const [selectedPriority, setSelectedPriority] = React.useState<string>('');

  const assignees =
    issues
      .map((issue) => issue.assignee)
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t?.id === item?.id)
      ) || [];

  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(assigneeId)
        ? prev.filter((id) => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAssigneeIds([]);
    setSelectedPriority('');
  };

  useEffect(() => {
    const filteredIssues = issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedAssigneeIds.length === 0 ||
          selectedAssigneeIds.includes(issue.assignee?.id || '')) &&
        (selectedPriority === '' || issue.priority === selectedPriority)
    );
    onFilterChange(filteredIssues);
  }, [issues, searchTerm, selectedAssigneeIds, selectedPriority]);

  const isFiltersApplied =
    searchTerm !== '' ||
    selectedAssigneeIds.length > 0 ||
    selectedPriority !== '';

  return (
    <div className="space-y-4">
      <div className="flex flex-col pr-2 sm:flex-row gap-4 sm:gap-6 mt-6">
        <Input
          className="w-full sm:w-72"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="shrink-0">
          <div className="flex gap-2 flex-wrap">
            {assignees.map((assignee, index) => {
              const selected = selectedAssigneeIds.includes(assignee?.id || '');
              return (
                <div
                  className={`rounded-full ring ${
                    selected ? 'ring-blue-600' : 'ring-black'
                  } ${index > 0 ? '-ml-6' : ''}`}
                  style={{ zIndex: index }}
                  key={assignee?.id}
                  onClick={() => toggleAssignee(assignee?.id || '')}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignee?.imageUrl || ''} />
                    <AvatarFallback>{assignee?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
        </div>

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>

          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltersApplied && (
          <Button
            variant={'ghost'}
            onClick={clearFilters}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default BoardFilters;
