export interface Child {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  allergiesNotes: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  childId: string;
  childName: string;
  parentName: string;
  parentPhone: string;
  checkInTime: string | null;
  droppedOffBy: string | null;
  checkOutTime: string | null;
  pickedUpBy: string | null;
}

export type AttendanceStatus = 'not-checked-in' | 'checked-in' | 'checked-out';
