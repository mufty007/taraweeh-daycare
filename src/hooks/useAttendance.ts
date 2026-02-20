// useAttendance — persists check-in/out to Supabase with realtime sync & DB fallback
import { useState, useCallback, useEffect, useRef } from 'react';
import { AttendanceRecord, AttendanceStatus, Child } from '@/types/attendance';
import { supabase } from '@/integrations/supabase/client';
import { 
  getRegisteredChildren, 
  checkInChild, 
  checkOutChild,
  RegistrationChild,
} from '@/services/googleSheetsApi';

function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function todayDate(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

// Map from DB UUID child_id → external (Sheet) id
// so we can match attendance records to the children list
type IdMap = Map<string, string>; // dbUuid → externalId

export function useAttendance() {
  const [children, setChildren] = useState<Child[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Maps DB UUID → external/sheet ID for matching
  const idMapRef = useRef<IdMap>(new Map());

  // Build the id map from children table
  const buildIdMap = useCallback(async () => {
    const { data } = await supabase
      .from('children')
      .select('id, external_id');
    if (data) {
      const map = new Map<string, string>();
      for (const row of data) {
        if (row.external_id) {
          map.set(row.id, row.external_id);
        }
      }
      idMapRef.current = map;
    }
  }, []);

  // Convert DB attendance rows to AttendanceRecord using external ids
  const mapAttendanceRows = useCallback((rows: any[]): AttendanceRecord[] => {
    return rows.map((r: any) => {
      // Resolve external_id from the id map so status matching works
      const externalId = idMapRef.current.get(r.child_id) || r.child_id;
      return {
        id: r.id,
        date: r.date,
        childId: externalId,
        childName: r.child_name,
        parentName: r.parent_name,
        parentPhone: r.parent_phone,
        checkInTime: r.check_in_time,
        droppedOffBy: r.dropped_off_by,
        checkOutTime: r.check_out_time,
        pickedUpBy: r.picked_up_by,
      };
    });
  }, []);

  // Sync children from Google Sheet → Supabase children table
  const syncChildrenToDb = useCallback(async (sheetChildren: Child[]) => {
    for (const child of sheetChildren) {
      await supabase
        .from('children')
        .upsert({
          external_id: child.id,
          child_name: child.name,
          parent_name: child.parentName,
          parent_phone: child.parentPhone,
          parent_email: child.parentEmail,
          allergies_notes: child.allergiesNotes,
        }, { onConflict: 'external_id' })
        .select();
    }
  }, []);

  // Fallback: load children from DB if Google Sheets is down
  const loadChildrenFromDb = useCallback(async (): Promise<Child[]> => {
    const { data } = await supabase
      .from('children')
      .select('*')
      .order('child_name');
    if (!data || data.length === 0) return [];
    return data.map((c: any) => ({
      id: c.external_id || c.id,
      name: c.child_name,
      parentName: c.parent_name,
      parentPhone: c.parent_phone,
      parentEmail: c.parent_email,
      allergiesNotes: c.allergies_notes,
    }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let mappedChildren: Child[];

      // 1. Try Google Sheet first, fall back to DB
      try {
        const childrenRes = await getRegisteredChildren();
        if (childrenRes.error) throw new Error(childrenRes.error);

        mappedChildren = childrenRes.children.map((c: RegistrationChild) => ({
          id: c.id.toString(),
          name: c.childName,
          parentName: c.parentName,
          parentPhone: c.parentPhone,
          parentEmail: c.parentEmail,
          allergiesNotes: c.allergies || 'None',
        }));

        // Sync to DB in background
        syncChildrenToDb(mappedChildren).catch(() => {});
      } catch (sheetErr) {
        console.warn('Google Sheet unavailable, falling back to database:', sheetErr);
        mappedChildren = await loadChildrenFromDb();
        if (mappedChildren.length === 0) {
          throw new Error('Could not load children from Google Sheet or database');
        }
      }

      setChildren(mappedChildren);

      // 2. Build the UUID → external_id map
      await buildIdMap();

      // 3. Load today's attendance from Supabase
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', todayDate());

      if (attendanceData) {
        setTodayRecords(mapAttendanceRows(attendanceData));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [syncChildrenToDb, loadChildrenFromDb, buildIdMap, mapAttendanceRows]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription — updates from other devices
  useEffect(() => {
    const channel = supabase
      .channel('attendance-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `date=eq.${todayDate()}`,
        },
        () => {
          // Re-fetch today's records on any change
          supabase
            .from('attendance')
            .select('*')
            .eq('date', todayDate())
            .then(({ data }) => {
              if (data) {
                setTodayRecords(mapAttendanceRows(data));
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapAttendanceRows]);

  const getChildStatus = useCallback((childId: string): AttendanceStatus => {
    const record = todayRecords.find(r => r.childId === childId);
    if (!record || !record.checkInTime) return 'not-checked-in';
    if (record.checkOutTime) return 'checked-out';
    return 'checked-in';
  }, [todayRecords]);

  const getChildRecord = useCallback((childId: string): AttendanceRecord | undefined => {
    return todayRecords.find(r => r.childId === childId);
  }, [todayRecords]);

  // Helper: ensure child exists in DB and get its UUID
  const getOrCreateDbChild = useCallback(async (child: Child): Promise<string> => {
    const { data: existing } = await supabase
      .from('children')
      .select('id')
      .eq('external_id', child.id)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: created } = await supabase
      .from('children')
      .insert({
        external_id: child.id,
        child_name: child.name,
        parent_name: child.parentName,
        parent_phone: child.parentPhone,
        parent_email: child.parentEmail,
        allergies_notes: child.allergiesNotes,
      })
      .select('id')
      .single();

    return created!.id;
  }, []);

  const checkIn = useCallback(async (childId: string, droppedOffBy: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const checkInTime = getCurrentTime();
    const dbChildId = await getOrCreateDbChild(child);

    // Update the id map
    idMapRef.current.set(dbChildId, childId);

    const { error: dbError } = await supabase
      .from('attendance')
      .upsert({
        date: todayDate(),
        child_id: dbChildId,
        child_name: child.name,
        parent_name: child.parentName,
        parent_phone: child.parentPhone,
        check_in_time: checkInTime,
        dropped_off_by: droppedOffBy,
        check_out_time: null,
        picked_up_by: null,
      }, { onConflict: 'date,child_id' });

    if (dbError) {
      console.error('DB check-in error:', dbError);
      throw dbError;
    }

    // Optimistic update — use the external/sheet childId
    setTodayRecords(prev => {
      const existing = prev.findIndex(r => r.childId === childId);
      const newRecord: AttendanceRecord = {
        id: `${todayDate()}-${childId}`,
        date: todayDate(),
        childId,
        childName: child.name,
        parentName: child.parentName,
        parentPhone: child.parentPhone,
        checkInTime,
        droppedOffBy,
        checkOutTime: null,
        pickedUpBy: null,
      };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newRecord;
        return updated;
      }
      return [...prev, newRecord];
    });

    // Sync to Google Sheet (fire-and-forget)
    checkInChild({
      childName: child.name,
      parentName: child.parentName,
      parentPhone: child.parentPhone,
      checkInTime,
      dropOffPerson: droppedOffBy,
    }).catch(() => console.warn('Sheet check-in sync failed'));
  }, [children, getOrCreateDbChild]);

  const checkOut = useCallback(async (childId: string, pickedUpBy: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const checkOutTime = getCurrentTime();
    const dbChildId = await getOrCreateDbChild(child);

    const { error: dbError } = await supabase
      .from('attendance')
      .update({
        check_out_time: checkOutTime,
        picked_up_by: pickedUpBy,
      })
      .eq('date', todayDate())
      .eq('child_id', dbChildId);

    if (dbError) {
      console.error('DB check-out error:', dbError);
      throw dbError;
    }

    // Optimistic update
    setTodayRecords(prev =>
      prev.map(record =>
        record.childId === childId
          ? { ...record, checkOutTime, pickedUpBy }
          : record
      )
    );

    // Sync to Google Sheet (fire-and-forget)
    checkOutChild({
      childName: child.name,
      checkOutTime,
      pickUpPerson: pickedUpBy,
    }).catch(() => console.warn('Sheet check-out sync failed'));
  }, [children, getOrCreateDbChild]);

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
