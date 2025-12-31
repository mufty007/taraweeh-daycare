const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpFlis6sGz_B2e8YR-eQ0bWmpx5pU4uT-T32wpwMva5HzQmL91DoP8EqEtDVH_3D7b/exec';

export interface RegistrationChild {
  id: number;
  childName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  allergies: string;
}

export interface AttendanceRecord {
  checkedIn: boolean;
  checkInTime: string;
  dropOffPerson: string;
}

export interface ChildrenResponse {
  children: RegistrationChild[];
  count: number;
  timestamp: string;
  error?: string;
}

export interface AttendanceResponse {
  attendance: Record<string, AttendanceRecord>;
  date: string;
  rowsChecked: number;
  error?: string;
}

export interface CheckInData {
  childName: string;
  parentName: string;
  parentPhone: string;
  checkInTime: string;
  dropOffPerson: string;
}

export interface CheckOutData {
  childName: string;
  checkOutTime: string;
  pickUpPerson: string;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    childName: string;
    time: string;
    date?: string;
  };
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export async function getRegisteredChildren(): Promise<ChildrenResponse> {
  const url = `${SCRIPT_URL}?action=getChildren`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch children');
  }
  return response.json();
}

export async function getTodayAttendance(): Promise<AttendanceResponse> {
  const url = `${SCRIPT_URL}?action=getAttendance`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }
  return response.json();
}

export async function checkInChild(data: CheckInData): Promise<ActionResponse> {
  const params = new URLSearchParams({
    action: 'checkIn',
    childName: data.childName,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    checkInTime: data.checkInTime || getCurrentTime(),
    dropOffPerson: data.dropOffPerson,
  });
  
  const url = `${SCRIPT_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to check in');
  }
  return response.json();
}

export async function checkOutChild(data: CheckOutData): Promise<ActionResponse> {
  const params = new URLSearchParams({
    action: 'checkOut',
    childName: data.childName,
    checkOutTime: data.checkOutTime || getCurrentTime(),
    pickUpPerson: data.pickUpPerson,
  });
  
  const url = `${SCRIPT_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to check out');
  }
  return response.json();
}
