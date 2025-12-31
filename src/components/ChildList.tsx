import { Child, AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { ChildCard } from './ChildCard';

interface ChildListProps {
  children: Child[];
  getStatus: (childId: string) => AttendanceStatus;
  getRecord: (childId: string) => AttendanceRecord | undefined;
  onCheckIn: (childId: string, droppedOffBy: string) => void;
  onCheckOut: (childId: string, pickedUpBy: string) => void;
}

export function ChildList({ children, getStatus, getRecord, onCheckIn, onCheckOut }: ChildListProps) {
  if (children.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No children found</p>
        <p className="text-sm mt-1">Try adjusting your search</p>
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
