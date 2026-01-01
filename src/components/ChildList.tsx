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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface ChildListProps {
  children: Child[];
  getStatus: (childId: string) => AttendanceStatus;
  getRecord: (childId: string) => AttendanceRecord | undefined;
  onCheckIn: (childId: string, droppedOffBy: string) => void;
  onCheckOut: (childId: string, pickedUpBy: string) => void;
  viewMode: 'grid' | 'list';
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}

export function ChildList({ 
  children, 
  getStatus, 
  getRecord, 
  onCheckIn, 
  onCheckOut, 
  viewMode,
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}: ChildListProps) {
  if (children.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No children found</p>
        <p className="text-sm mt-1">Try adjusting your search</p>
      </div>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages: (number | 'ellipsis')[] = [];
      
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push('ellipsis');
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) pages.push(i);
        
        if (currentPage < totalPages - 2) pages.push('ellipsis');
        pages.push(totalPages);
      }
      
      return pages;
    };

    return (
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * 12 + 1}-{Math.min(currentPage * 12, totalItems)} of {totalItems} children
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, idx) => (
              <PaginationItem key={idx}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div>
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
        {renderPagination()}
      </div>
    );
  }

  return (
    <div>
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
      {renderPagination()}
    </div>
  );
}
