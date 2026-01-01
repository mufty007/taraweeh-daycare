import { useState } from 'react';
import { User, Phone, AlertCircle, LogIn, LogOut, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Child, AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface ChildCardProps {
  child: Child;
  status: AttendanceStatus;
  record?: AttendanceRecord;
  onCheckIn: (childId: string, droppedOffBy: string) => void;
  onCheckOut: (childId: string, pickedUpBy: string) => void;
}

export function ChildCard({ child, status, record, onCheckIn, onCheckOut }: ChildCardProps) {
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
      border: 'border-border hover:border-primary/30',
      badge: 'bg-muted text-muted-foreground border border-border',
      badgeText: 'Not Arrived',
    },
    'checked-in': {
      border: 'border-success/40 hover:border-success/60',
      badge: 'bg-success/10 text-success border border-success/30',
      badgeText: 'Checked In',
    },
    'checked-out': {
      border: 'border-accent/40 hover:border-accent/60',
      badge: 'bg-accent/10 text-accent-foreground border border-accent/30',
      badgeText: 'Checked Out',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      'rounded-xl border bg-card p-5 transition-all duration-300 animate-slide-up shadow-sm hover:shadow-md',
      config.border
    )}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-muted border border-border">
          <User className="w-6 h-6 text-muted-foreground" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-base">{child.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{child.parentName}</p>
            </div>
            <span className={cn('text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap', config.badge)}>
              {config.badgeText}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <Phone className="w-4 h-4" />
            <span>{child.parentPhone}</span>
          </div>

          {child.allergiesNotes && child.allergiesNotes !== 'None' && (
            <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-2.5 py-1 rounded-md w-fit mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{child.allergiesNotes}</span>
            </div>
          )}

          {record && (
            <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-sm">
              {record.checkInTime && (
                <div className="flex items-center gap-2 text-success">
                  <Clock className="w-3.5 h-3.5" />
                  <span>In: {record.checkInTime} by {record.droppedOffBy}</span>
                </div>
              )}
              {record.checkOutTime && (
                <div className="flex items-center gap-2 text-accent-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Out: {record.checkOutTime} by {record.pickedUpBy}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4">
            {status === 'not-checked-in' && !showCheckIn && (
              <Button
                variant="checkin"
                size="sm"
                onClick={() => setShowCheckIn(true)}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Check In
              </Button>
            )}

            {status === 'checked-in' && !showCheckOut && (
              <Button
                variant="checkout"
                size="sm"
                onClick={() => setShowCheckOut(true)}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Check Out
              </Button>
            )}

            {status === 'checked-out' && !showCheckIn && (
              <Button
                variant="checkin"
                size="sm"
                onClick={() => setShowCheckIn(true)}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Check In Again
              </Button>
            )}
          </div>
        </div>
      </div>

      {showCheckIn && (
        <div className="mt-4 pt-4 border-t border-border animate-scale-in">
          <p className="text-sm font-medium text-foreground mb-2">Who is dropping off?</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter name..."
              value={droppedOffBy}
              onChange={(e) => setDroppedOffBy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
              className="flex-1"
              autoFocus
            />
            <Button variant="checkin" onClick={handleCheckIn} disabled={!droppedOffBy.trim()}>
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setShowCheckIn(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showCheckOut && (
        <div className="mt-4 pt-4 border-t border-border animate-scale-in">
          <p className="text-sm font-medium text-foreground mb-2">Who is picking up?</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter name..."
              value={pickedUpBy}
              onChange={(e) => setPickedUpBy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckOut()}
              className="flex-1"
              autoFocus
            />
            <Button variant="checkout" onClick={handleCheckOut} disabled={!pickedUpBy.trim()}>
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setShowCheckOut(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
