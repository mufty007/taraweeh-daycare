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
import { RefreshCw, Loader2, History, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(child => 
        child.name.toLowerCase().includes(query) ||
        child.parentName.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(child => getChildStatus(child.id) === statusFilter);
    }
    return result;
  }, [children, searchQuery, statusFilter, getChildStatus]);

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

  // Refetch children list whenever window regains focus (picks up new Google Form signups)
  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

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

  const handleExportCSV = async () => {
    const today = new Date().toLocaleDateString('en-CA');
    const { data: records } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', today);

    if (!records || records.length === 0) {
      toast.info('No records to export for today');
      return;
    }
    const header = 'Child Name,Parent Name,Parent Phone,Check-In Time,Dropped Off By,Check-Out Time,Picked Up By,Date';
    const rows = records.map((r: any) =>
      [
        r.child_name,
        r.parent_name,
        r.parent_phone,
        r.check_in_time || '',
        r.dropped_off_by || '',
        r.check_out_time || '',
        r.picked_up_by || '',
        r.date,
      ].map(v => `"${v}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${records.length} record(s) as CSV`);
  };

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  title="Download today's attendance as CSV"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
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
