import { Child, AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { ChildCard } from './ChildCard';
import { ChildListRow } from './ChildListRow';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ChildListProps {
  children: Child[];
  getStatus: (childId: string) => AttendanceStatus;
  getRecord: (childId: string) => AttendanceRecord | undefined;
  onCheckIn: (childId: string, droppedOffBy: string) => void;
  onCheckOut: (childId: string, pickedUpBy: string) => void;
  viewMode: 'grid' | 'list';
}

export function ChildList({ children, getStatus, getRecord, onCheckIn, onCheckOut, viewMode }: ChildListProps) {
  if (children.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No children found</p>
        <p className="text-sm mt-1">Try adjusting your search</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Child</TableHead>
              <TableHead className="font-semibold">Parent</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Allergies</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="text-right font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <ChildListRow
                key={child.id}
                child={child}
                status={getStatus(child.id)}
                record={getRecord(child.id)}
                onCheckIn={onCheckIn}
                onCheckOut={onCheckOut}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {children.map((child, index) => (
        <div key={child.id} style={{ animationDelay: `${index * 0.05}s` }}>
          <ChildCard
            child={child}
            status={getStatus(child.id)}
            record={getRecord(child.id)}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
          />
        </div>
      ))}
    </div>
  );
}
