import { useState, useCallback, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, Child } from '@/types/attendance';
import { 
  getRegisteredChildren, 
  getTodayAttendance, 
  checkInChild, 
  checkOutChild,
  RegistrationChild,
  AttendanceRecord as ApiAttendanceRecord
} from '@/services/googleSheetsApi';

function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export function useAttendance() {
  const [children, setChildren] = useState<Child[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch children and attendance from Google Sheets
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [childrenRes, attendanceRes] = await Promise.all([
        getRegisteredChildren(),
        getTodayAttendance()
      ]);

      if (childrenRes.error) {
        throw new Error(childrenRes.error);
      }

      // Map API children to our Child type
      const mappedChildren: Child[] = childrenRes.children.map((c: RegistrationChild) => ({
        id: c.id.toString(),
        name: c.childName,
        parentName: c.parentName,
        parentPhone: c.parentPhone,
        parentEmail: c.parentEmail,
        allergiesNotes: c.allergies || 'None',
      }));

      setChildren(mappedChildren);

      // Map attendance to our records format
      if (attendanceRes.attendance && !attendanceRes.error) {
        const records: AttendanceRecord[] = [];
        
        Object.entries(attendanceRes.attendance).forEach(([childName, data]) => {
          const child = mappedChildren.find(c => c.name === childName);
          if (child && (data as ApiAttendanceRecord).checkedIn) {
            records.push({
              id: `${attendanceRes.date}-${child.id}`,
              date: attendanceRes.date,
              childId: child.id,
              childName: child.name,
              parentName: child.parentName,
              parentPhone: child.parentPhone,
              checkInTime: (data as ApiAttendanceRecord).checkInTime,
              droppedOffBy: (data as ApiAttendanceRecord).dropOffPerson,
              checkOutTime: null,
              pickedUpBy: null,
            });
          }
        });
        
        setTodayRecords(records);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getChildStatus = useCallback((childId: string): AttendanceStatus => {
    const record = todayRecords.find(r => r.childId === childId);
    if (!record || !record.checkInTime) return 'not-checked-in';
    if (record.checkOutTime) return 'checked-out';
    return 'checked-in';
  }, [todayRecords]);

  const getChildRecord = useCallback((childId: string): AttendanceRecord | undefined => {
    return todayRecords.find(r => r.childId === childId);
  }, [todayRecords]);

  const checkIn = useCallback(async (childId: string, droppedOffBy: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const checkInTime = getCurrentTime();
    
    // Optimistic update
    const newRecord: AttendanceRecord = {
      id: `${new Date().toLocaleDateString()}-${childId}`,
      date: new Date().toLocaleDateString(),
      childId,
      childName: child.name,
      parentName: child.parentName,
      parentPhone: child.parentPhone,
      checkInTime,
      droppedOffBy,
      checkOutTime: null,
      pickedUpBy: null,
    };

    setTodayRecords(prev => {
      const existing = prev.findIndex(r => r.childId === childId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newRecord;
        return updated;
      }
      return [...prev, newRecord];
    });

    // Call API
    try {
      await checkInChild({
        childName: child.name,
        parentName: child.parentName,
        parentPhone: child.parentPhone,
        checkInTime,
        dropOffPerson: droppedOffBy,
      });
    } catch (err) {
      console.error('Error checking in:', err);
      // Revert on error
      setTodayRecords(prev => prev.filter(r => r.childId !== childId));
      throw err;
    }
  }, [children]);

  const checkOut = useCallback(async (childId: string, pickedUpBy: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const checkOutTime = getCurrentTime();

    // Optimistic update
    setTodayRecords(prev => 
      prev.map(record => 
        record.childId === childId
          ? { ...record, checkOutTime, pickedUpBy }
          : record
      )
    );

    // Call API
    try {
      await checkOutChild({
        childName: child.name,
        checkOutTime,
        pickUpPerson: pickedUpBy,
      });
    } catch (err) {
      console.error('Error checking out:', err);
      // Revert on error
      setTodayRecords(prev => 
        prev.map(record => 
          record.childId === childId
            ? { ...record, checkOutTime: null, pickedUpBy: null }
            : record
        )
      );
      throw err;
    }
  }, [children]);

  const getStats = useCallback(() => {
    const checkedIn = todayRecords.filter(r => r.checkInTime && !r.checkOutTime).length;
    const checkedOut = todayRecords.filter(r => r.checkOutTime).length;
    const notCheckedIn = children.length - todayRecords.length;
    
    return { checkedIn, checkedOut, notCheckedIn, total: children.length };
  }, [todayRecords, children.length]);

  return {
    children,
    todayRecords,
    getChildStatus,
    getChildRecord,
    checkIn,
    checkOut,
    getStats,
    isLoading,
    error,
    refetch: fetchData,
  };
}
