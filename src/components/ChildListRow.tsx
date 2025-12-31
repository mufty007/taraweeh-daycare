import { useState } from 'react';
import { Phone, AlertCircle, LogIn, LogOut, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Child, AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { cn } from '@/lib/utils';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';

interface ChildListRowProps {
  child: Child;
  status: AttendanceStatus;
  record?: AttendanceRecord;
  onCheckIn: (childId: string, droppedOffBy: string) => void;
  onCheckOut: (childId: string, pickedUpBy: string) => void;
}

export function ChildListRow({ child, status, record, onCheckIn, onCheckOut }: ChildListRowProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [droppedOffBy, setDroppedOffBy] = useState('');
  const [pickedUpBy, setPickedUpBy] = useState('');

  const handleCheckIn = () => {
    if (droppedOffBy.trim()) {
      onCheckIn(child.id, droppedOffBy.trim());
      setDroppedOffBy('');
      setShowCheckIn(false);
    }
  };

  const handleCheckOut = () => {
    if (pickedUpBy.trim()) {
      onCheckOut(child.id, pickedUpBy.trim());
      setPickedUpBy('');
      setShowCheckOut(false);
    }
  };

  const statusConfig = {
    'not-checked-in': {
      badge: 'bg-muted text-muted-foreground',
      badgeText: 'Not Arrived',
      rowBg: '',
    },
    'checked-in': {
      badge: 'bg-success text-success-foreground',
      badgeText: 'Checked In',
      rowBg: 'bg-success/5',
    },
    'checked-out': {
      badge: 'bg-accent text-accent-foreground',
      badgeText: 'Checked Out',
      rowBg: 'bg-accent/10',
    },
  };

  const config = statusConfig[status];

  if (showCheckIn || showCheckOut) {
    return (
      <TableRow className={config.rowBg}>
        <TableCell colSpan={6} className="py-4">
          <div className="flex items-center gap-4">
            <span className="font-medium min-w-32">{child.name}</span>
            <span className="text-sm text-muted-foreground">
              {showCheckIn ? 'Who is dropping off?' : 'Who is picking up?'}
            </span>
            <Input
              type="text"
              placeholder="Enter name..."
              value={showCheckIn ? droppedOffBy : pickedUpBy}
              onChange={(e) => showCheckIn ? setDroppedOffBy(e.target.value) : setPickedUpBy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (showCheckIn ? handleCheckIn() : handleCheckOut())}
              className="max-w-48"
              autoFocus
            />
            <Button 
              variant={showCheckIn ? "checkin" : "checkout"} 
              size="sm"
              onClick={showCheckIn ? handleCheckIn : handleCheckOut} 
              disabled={showCheckIn ? !droppedOffBy.trim() : !pickedUpBy.trim()}
            >
              Confirm
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setShowCheckIn(false);
              setShowCheckOut(false);
            }}>
              Cancel
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className={cn('transition-colors', config.rowBg)}>
      <TableCell className="font-medium">{child.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{child.parentName}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          <span>{child.parentPhone}</span>
        </div>
      </TableCell>
      <TableCell>
        {child.allergiesNotes && child.allergiesNotes !== 'None' ? (
          <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-md w-fit">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{child.allergiesNotes}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {record?.checkInTime && (
            <div className="flex items-center gap-1.5 text-xs text-success">
              <Clock className="w-3 h-3" />
              <span>In: {record.checkInTime}</span>
            </div>
          )}
          {record?.checkOutTime && (
            <div className="flex items-center gap-1.5 text-xs text-accent-foreground">
              <Clock className="w-3 h-3" />
              <span>Out: {record.checkOutTime}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', config.badge)}>
            {config.badgeText}
          </span>
          
          {status === 'not-checked-in' && (
            <Button variant="checkin" size="sm" onClick={() => setShowCheckIn(true)}>
              <LogIn className="w-3.5 h-3.5" />
              Check In
            </Button>
          )}
          
          {status === 'checked-in' && (
            <Button variant="checkout" size="sm" onClick={() => setShowCheckOut(true)}>
              <LogOut className="w-3.5 h-3.5" />
              Check Out
            </Button>
          )}
          
          {status === 'checked-out' && (
            <div className="flex items-center gap-1 text-success">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
