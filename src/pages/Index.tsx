import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { SearchBar } from '@/components/SearchBar';
import { ChildList } from '@/components/ChildList';
import { ViewToggle } from '@/components/ViewToggle';
import { StatusFilter, FilterStatus } from '@/components/StatusFilter';
import { useAttendance } from '@/hooks/useAttendance';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { RefreshCw, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { 
    children, 
    getChildStatus, 
    getChildRecord, 
    checkIn, 
    checkOut, 
    getStats,
    isLoading,
    error,
    refetch
  } = useAttendance();

  const filteredChildren = useMemo(() => {
    let result = children;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(child => 
        child.name.toLowerCase().includes(query) ||
        child.parentName.toLowerCase().includes(query)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(child => getChildStatus(child.id) === statusFilter);
    }
    
    return result;
  }, [children, searchQuery, statusFilter, getChildStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredChildren.length / ITEMS_PER_PAGE);
  const paginatedChildren = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredChildren.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredChildren, currentPage]);

  const filterCounts = useMemo(() => {
    return {
      all: children.length,
      'checked-in': children.filter(c => getChildStatus(c.id) === 'checked-in').length,
      'checked-out': children.filter(c => getChildStatus(c.id) === 'checked-out').length,
      'not-checked-in': children.filter(c => getChildStatus(c.id) === 'not-checked-in').length,
    };
  }, [children, getChildStatus]);

  const handleCheckIn = async (childId: string, droppedOffBy: string) => {
    const child = children.find(c => c.id === childId);
    try {
      await checkIn(childId, droppedOffBy);
      toast.success(`${child?.name} checked in`, {
        description: `Dropped off by ${droppedOffBy}`,
      });
    } catch {
      toast.error(`Failed to check in ${child?.name}`);
    }
  };

  const handleCheckOut = async (childId: string, pickedUpBy: string) => {
    const child = children.find(c => c.id === childId);
    try {
      await checkOut(childId, pickedUpBy);
      toast.success(`${child?.name} checked out`, {
        description: `Picked up by ${pickedUpBy}`,
      });
    } catch {
      toast.error(`Failed to check out ${child?.name}`);
    }
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsCards stats={stats} isLoading={isLoading} />
        
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg shadow-primary/5">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">Children</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetch}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/history">
                  <Button variant="outline" size="sm">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </Link>
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
              </div>
            </div>
            
            <StatusFilter 
              value={statusFilter} 
              onChange={setStatusFilter} 
              counts={filterCounts}
            />
            
            <div className="w-full sm:max-w-md">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ChildList
              children={paginatedChildren}
              getStatus={getChildStatus}
              getRecord={getChildRecord}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              viewMode={viewMode}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredChildren.length}
            />
          )}
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default Index;
