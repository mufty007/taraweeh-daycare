import { useState, useCallback, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, Child } from '@/types/attendance';
import { 
  getRegisteredChildren, 
  checkInChild, 
  checkOutChild,
  saveAttendanceToStorage,
  loadAttendanceFromStorage,
  RegistrationChild,
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

  const persistRecords = useCallback((records: AttendanceRecord[]) => {
    saveAttendanceToStorage(records);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const childrenRes = await getRegisteredChildren();

      if (childrenRes.error) {
        throw new Error(childrenRes.error);
      }

      const mappedChildren: Child[] = childrenRes.children.map((c: RegistrationChild) => ({
        id: c.id.toString(),
        name: c.childName,
        parentName: c.parentName,
        parentPhone: c.parentPhone,
        parentEmail: c.parentEmail,
        allergiesNotes: c.allergies || 'None',
      }));

      setChildren(mappedChildren);

      // Load today's attendance from localStorage
      const stored = loadAttendanceFromStorage();
      setTodayRecords(stored as AttendanceRecord[]);

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
    
    const newRecord: AttendanceRecord = {
      id: `${new Date().toLocaleDateString('en-CA')}-${childId}-${Date.now()}`,
      date: new Date().toLocaleDateString('en-CA'),
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
      let updated: AttendanceRecord[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = newRecord;
      } else {
        updated = [...prev, newRecord];
      }
      persistRecords(updated);
      return updated;
    });

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
      setTodayRecords(prev => {
        const reverted = prev.filter(r => r.childId !== childId);
        persistRecords(reverted);
        return reverted;
      });
      throw err;
    }
  }, [children, persistRecords]);

  const checkOut = useCallback(async (childId: string, pickedUpBy: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const checkOutTime = getCurrentTime();

    setTodayRecords(prev => {
      const updated = prev.map(record => 
        record.childId === childId
          ? { ...record, checkOutTime, pickedUpBy }
          : record
      );
      persistRecords(updated);
      return updated;
    });

    try {
      await checkOutChild({
        childName: child.name,
        checkOutTime,
        pickUpPerson: pickedUpBy,
      });
    } catch (err) {
      console.error('Error checking out:', err);
      setTodayRecords(prev => {
        const reverted = prev.map(record => 
          record.childId === childId
            ? { ...record, checkOutTime: null, pickedUpBy: null }
            : record
        );
        persistRecords(reverted);
        return reverted;
      });
      throw err;
    }
  }, [children, persistRecords]);

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
