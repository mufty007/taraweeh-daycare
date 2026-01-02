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
      bgColor: 'bg-primary',
      textColor: 'text-primary-foreground',
      iconBg: 'bg-primary-foreground/20',
    },
    {
      title: 'Checked In',
      value: stats.checkedIn,
      icon: UserCheck,
      bgColor: 'bg-success',
      textColor: 'text-success-foreground',
      iconBg: 'bg-success-foreground/20',
    },
    {
      title: 'Checked Out',
      value: stats.checkedOut,
      icon: Clock,
      bgColor: 'bg-accent',
      textColor: 'text-accent-foreground',
      iconBg: 'bg-accent-foreground/20',
    },
    {
      title: 'Not Arrived',
      value: stats.notCheckedIn,
      icon: UserX,
      bgColor: 'bg-secondary',
      textColor: 'text-secondary-foreground',
      iconBg: 'bg-secondary-foreground/20',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={cn(
            'relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
            card.bgColor
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={cn('text-sm font-medium mb-2 opacity-80', card.textColor)}>{card.title}</p>
              {isLoading ? (
                <div className="h-10 w-14 bg-white/20 rounded animate-pulse" />
              ) : (
                <p className={cn('text-4xl font-bold tracking-tight', card.textColor)}>{card.value}</p>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', card.iconBg)}>
              <card.icon className={cn('w-6 h-6', card.textColor)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
