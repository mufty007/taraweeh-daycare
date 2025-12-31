import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { getAttendanceHistory, HistoryRecord } from '@/services/googleSheetsApi';
import { Loader2, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const History = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        setIsLoading(true);
        const data = await getAttendanceHistory();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Get unique dates
  const uniqueDates = [...new Set(records.map(r => r.date))].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Filter by selected date
  const filteredRecords = selectedDate
    ? records.filter(r => r.date === selectedDate)
    : records;

  // Group by date
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, HistoryRecord[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Attendance History</h1>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg shadow-primary/5">
          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              <option value="">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
            {selectedDate && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedDate('')}>
                Clear
              </Button>
            )}
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
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map(date => (
                <div key={date}>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {date}
                    <Badge variant="secondary" className="ml-2">
                      {groupedRecords[date].length} records
                    </Badge>
                  </h3>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Child</TableHead>
                          <TableHead className="font-semibold">Parent</TableHead>
                          <TableHead className="font-semibold">Check In</TableHead>
                          <TableHead className="font-semibold">Dropped Off By</TableHead>
                          <TableHead className="font-semibold">Check Out</TableHead>
                          <TableHead className="font-semibold">Picked Up By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedRecords[date].map((record, idx) => (
                          <TableRow key={`${record.date}-${record.childName}-${idx}`}>
                            <TableCell className="font-medium">{record.childName}</TableCell>
                            <TableCell>{record.parentName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                {record.checkInTime || '-'}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.droppedOffBy || '-'}</TableCell>
                            <TableCell>
                              {record.checkOutTime ? (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                                  {record.checkOutTime}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>{record.pickedUpBy || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
