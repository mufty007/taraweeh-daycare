import { AttendanceStatus } from '@/types/attendance';
import { cn } from '@/lib/utils';

export type FilterStatus = AttendanceStatus | 'all';

interface StatusFilterProps {
  value: FilterStatus;
  onChange: (status: FilterStatus) => void;
  counts: {
    all: number;
    'checked-in': number;
    'checked-out': number;
    'not-checked-in': number;
  };
}

const filters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'checked-out', label: 'Checked Out' },
  { value: 'not-checked-in', label: 'Not Checked In' },
];

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            "border border-border",
            value === filter.value
              ? filter.value === 'checked-in'
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : filter.value === 'checked-out'
                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                : filter.value === 'not-checked-in'
                ? "bg-muted text-muted-foreground border-border"
                : "bg-primary/10 text-primary border-primary/30"
              : "bg-background text-muted-foreground hover:bg-muted/50"
          )}
        >
          {filter.label}
          <span className="ml-1.5 text-xs opacity-70">({counts[filter.value]})</span>
        </button>
      ))}
    </div>
  );
}
