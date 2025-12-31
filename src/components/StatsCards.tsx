import { Users, LogIn, LogOut, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    checkedIn: number;
    checkedOut: number;
    notCheckedIn: number;
    total: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Registered</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
            <LogIn className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{stats.checkedIn}</p>
            <p className="text-xs text-muted-foreground">Checked In</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
            <LogOut className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-foreground">{stats.checkedOut}</p>
            <p className="text-xs text-muted-foreground">Checked Out</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{stats.notCheckedIn}</p>
            <p className="text-xs text-muted-foreground">Not Arrived</p>
          </div>
        </div>
      </div>
    </div>
  );
}
