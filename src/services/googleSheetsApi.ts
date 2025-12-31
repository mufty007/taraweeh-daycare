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

export interface HistoryRecord {
  date: string;
  childName: string;
  parentName: string;
  parentPhone: string;
  checkInTime: string;
  droppedOffBy: string;
  checkOutTime: string;
  pickedUpBy: string;
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
  const json = await response.json();
  
  // Handle both possible response formats (children array or data array)
  const rawChildren = json.children || json.data || [];
  
  // Map snake_case to camelCase if needed
  const children: RegistrationChild[] = rawChildren.map((c: Record<string, unknown>) => ({
    id: c.id || c.Id || 0,
    childName: c.childName || c.child_name || '',
    parentName: c.parentName || c.parent_name || '',
    parentPhone: c.parentPhone || c.parent_phone || '',
    parentEmail: c.parentEmail || c.parent_email || '',
    allergies: c.allergies || c.allergies_medical_notes || 'None',
  }));
  
  return {
    children,
    count: children.length,
    timestamp: json.timestamp || new Date().toISOString(),
    error: json.error,
  };
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
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      action: 'checkIn',
      data: {
        childName: data.childName,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        checkInTime: data.checkInTime || getCurrentTime(),
        dropOffPerson: data.dropOffPerson,
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to check in');
  }
  return response.json();
}

export async function checkOutChild(data: CheckOutData): Promise<ActionResponse> {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      action: 'checkOut',
      data: {
        childName: data.childName,
        checkOutTime: data.checkOutTime || getCurrentTime(),
        pickUpPerson: data.pickUpPerson,
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to check out');
  }
  return response.json();
}

export async function getAttendanceHistory(): Promise<HistoryRecord[]> {
  // Use getAttendance to fetch today's data since script doesn't have getHistory action
  const url = `${SCRIPT_URL}?action=getAttendance`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  const json = await response.json();
  
  if (json.attendance) {
    return Object.entries(json.attendance).map(([childName, data]) => {
      const record = data as AttendanceRecord;
      return {
        date: json.date || new Date().toLocaleDateString(),
        childName,
        parentName: '',
        parentPhone: '',
        checkInTime: record.checkInTime || '',
        droppedOffBy: record.dropOffPerson || '',
        checkOutTime: '',
        pickedUpBy: '',
      };
    });
  }
  
  return [];
}
