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
      bg: 'bg-gradient-to-br from-card to-muted/30',
      border: 'border-border/60 hover:border-primary/40',
      badge: 'bg-muted text-muted-foreground',
      badgeText: 'Not Arrived',
      badgeDot: 'bg-muted-foreground',
    },
    'checked-in': {
      bg: 'bg-gradient-to-br from-success/5 to-success/10',
      border: 'border-success/30 hover:border-success/50',
      badge: 'bg-success/15 text-success',
      badgeText: 'Checked In',
      badgeDot: 'bg-success',
    },
    'checked-out': {
      bg: 'bg-gradient-to-br from-accent/5 to-accent/15',
      border: 'border-accent/30 hover:border-accent/50',
      badge: 'bg-accent/20 text-accent-foreground',
      badgeText: 'Checked Out',
      badgeDot: 'bg-accent',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      'group relative rounded-2xl border-2 p-6 transition-all duration-300 animate-slide-up hover:shadow-lg hover:-translate-y-1',
      config.bg,
      config.border
    )}>
      {/* Status indicator dot */}
      <div className={cn('absolute top-4 right-4 w-2.5 h-2.5 rounded-full animate-pulse', config.badgeDot)} />

      {/* Header with Avatar and Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          'flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl transition-transform duration-300 group-hover:scale-105',
          status === 'checked-in' ? 'bg-success/20' : status === 'checked-out' ? 'bg-accent/25' : 'bg-primary/10'
        )}>
          <User className={cn(
            'w-7 h-7',
            status === 'checked-in' ? 'text-success' : status === 'checked-out' ? 'text-accent-foreground' : 'text-primary'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-lg leading-tight truncate">{child.name}</h3>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{child.parentName}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={cn(
          'inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full',
          config.badge
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', config.badgeDot)} />
          {config.badgeText}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
            <Phone className="w-4 h-4" />
          </div>
          <span className="font-medium">{child.parentPhone}</span>
        </div>

        {child.allergiesNotes && child.allergiesNotes !== 'None' && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-sm font-medium text-destructive">{child.allergiesNotes}</span>
          </div>
        )}
      </div>

      {/* Time Records */}
      {record && (record.checkInTime || record.checkOutTime) && (
        <div className="mb-4 p-3 rounded-xl bg-background/60 border border-border/50 space-y-2">
          {record.checkInTime && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-success">
                <LogIn className="w-4 h-4" />
                <span className="font-medium">In: {record.checkInTime}</span>
              </div>
              <span className="text-muted-foreground text-xs">by {record.droppedOffBy}</span>
            </div>
          )}
          {record.checkOutTime && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-accent-foreground">
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Out: {record.checkOutTime}</span>
              </div>
              <span className="text-muted-foreground text-xs">by {record.pickedUpBy}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto">
        {status === 'not-checked-in' && !showCheckIn && (
          <Button
            variant="checkin"
            size="default"
            onClick={() => setShowCheckIn(true)}
            className="w-full gap-2 font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <LogIn className="w-4 h-4" />
            Check In
          </Button>
        )}

        {status === 'checked-in' && !showCheckOut && (
          <Button
            variant="checkout"
            size="default"
            onClick={() => setShowCheckOut(true)}
            className="w-full gap-2 font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <LogOut className="w-4 h-4" />
            Check Out
          </Button>
        )}

        {status === 'checked-out' && !showCheckIn && (
          <Button
            variant="outline"
            size="default"
            onClick={() => setShowCheckIn(true)}
            className="w-full gap-2 font-semibold border-2 hover:bg-success/10 hover:border-success/50 hover:text-success transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Check In Again
          </Button>
        )}
      </div>

      {/* Check In Form */}
      {showCheckIn && (
        <div className="mt-4 pt-4 border-t border-border/50 animate-scale-in">
          <p className="text-sm font-semibold text-foreground mb-3">Who is dropping off?</p>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter name..."
              value={droppedOffBy}
              onChange={(e) => setDroppedOffBy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
              className="h-11"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="checkin" onClick={handleCheckIn} disabled={!droppedOffBy.trim()} className="flex-1 font-semibold">
                Confirm
              </Button>
              <Button variant="outline" onClick={() => setShowCheckIn(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Check Out Form */}
      {showCheckOut && (
        <div className="mt-4 pt-4 border-t border-border/50 animate-scale-in">
          <p className="text-sm font-semibold text-foreground mb-3">Who is picking up?</p>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter name..."
              value={pickedUpBy}
              onChange={(e) => setPickedUpBy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckOut()}
              className="h-11"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="checkout" onClick={handleCheckOut} disabled={!pickedUpBy.trim()} className="flex-1 font-semibold">
                Confirm
              </Button>
              <Button variant="outline" onClick={() => setShowCheckOut(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
