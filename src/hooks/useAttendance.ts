import { useState, useCallback } from 'react';
import { AttendanceRecord, AttendanceStatus, Child } from '@/types/attendance';
import { mockChildren, getTodayDateString, getCurrentTime } from '@/data/mockData';

export function useAttendance() {
  const [children] = useState<Child[]>(mockChildren);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);

  const getChildStatus = useCallback((childId: string): AttendanceStatus => {
    const record = todayRecords.find(r => r.childId === childId);
    if (!record || !record.checkInTime) return 'not-checked-in';
    if (record.checkOutTime) return 'checked-out';
    return 'checked-in';
  }, [todayRecords]);

  const getChildRecord = useCallback((childId: string): AttendanceRecord | undefined => {
    return todayRecords.find(r => r.childId === childId);
  }, [todayRecords]);

  const checkIn = useCallback((childId: string, droppedOffBy: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const newRecord: AttendanceRecord = {
      id: `${getTodayDateString()}-${childId}`,
      date: getTodayDateString(),
      childId,
      childName: child.name,
      parentName: child.parentName,
      parentPhone: child.parentPhone,
      checkInTime: getCurrentTime(),
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
  }, [children]);

  const checkOut = useCallback((childId: string, pickedUpBy: string) => {
    setTodayRecords(prev => 
      prev.map(record => 
        record.childId === childId
          ? { ...record, checkOutTime: getCurrentTime(), pickedUpBy }
          : record
      )
    );
  }, []);

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
  };
}
