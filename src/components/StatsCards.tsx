import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  checkedIn: number;
  checkedOut: number;
  notCheckedIn: number;
  total: number;
}

interface StatsCardsProps {
  stats: Stats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Enrolled',
      value: stats.total,
      icon: Users,
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Checked In',
      value: stats.checkedIn,
      icon: UserCheck,
      gradient: 'from-success/20 to-success/5',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      title: 'Checked Out',
      value: stats.checkedOut,
      icon: Clock,
      gradient: 'from-accent/30 to-accent/10',
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent-foreground',
    },
    {
      title: 'Not Arrived',
      value: stats.notCheckedIn,
      icon: UserX,
      gradient: 'from-muted to-muted/50',
      iconBg: 'bg-muted-foreground/10',
      iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={cn(
            'relative overflow-hidden rounded-2xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
            `bg-gradient-to-br ${card.gradient}`
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
              {isLoading ? (
                <div className="h-9 w-12 bg-muted rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-foreground tracking-tight">{card.value}</p>
              )}
            </div>
            <div className={cn('p-2.5 rounded-xl', card.iconBg)}>
              <card.icon className={cn('w-5 h-5', card.iconColor)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
