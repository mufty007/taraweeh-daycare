import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { SearchBar } from '@/components/SearchBar';
import { ChildList } from '@/components/ChildList';
import { useAttendance } from '@/hooks/useAttendance';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    children, 
    getChildStatus, 
    getChildRecord, 
    checkIn, 
    checkOut, 
    getStats 
  } = useAttendance();

  const filteredChildren = useMemo(() => {
    if (!searchQuery.trim()) return children;
    
    const query = searchQuery.toLowerCase();
    return children.filter(child => 
      child.name.toLowerCase().includes(query) ||
      child.parentName.toLowerCase().includes(query)
    );
  }, [children, searchQuery]);

  const handleCheckIn = (childId: string, droppedOffBy: string) => {
    const child = children.find(c => c.id === childId);
    checkIn(childId, droppedOffBy);
    toast.success(`${child?.name} checked in`, {
      description: `Dropped off by ${droppedOffBy}`,
    });
  };

  const handleCheckOut = (childId: string, pickedUpBy: string) => {
    const child = children.find(c => c.id === childId);
    checkOut(childId, pickedUpBy);
    toast.success(`${child?.name} checked out`, {
      description: `Picked up by ${pickedUpBy}`,
    });
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsCards stats={stats} />
        
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground">Children</h2>
            <div className="w-full sm:w-80">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          
          <ChildList
            children={filteredChildren}
            getStatus={getChildStatus}
            getRecord={getChildRecord}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default Index;
