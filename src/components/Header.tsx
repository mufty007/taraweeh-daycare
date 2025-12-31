import { Baby, Calendar } from 'lucide-react';

export function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Baby className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Taraweeh Daycare</h1>
              <p className="text-sm text-muted-foreground">Check-in / Check-out System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-secondary px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{today}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
