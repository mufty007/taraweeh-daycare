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

// ── localStorage helpers ──────────────────────────────────────────────────

const STORAGE_PREFIX = 'attendance_';

function todayKey(): string {
  return STORAGE_PREFIX + new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

export interface StoredAttendanceRecord {
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

export function saveAttendanceToStorage(records: StoredAttendanceRecord[]): void {
  localStorage.setItem(todayKey(), JSON.stringify(records));
}

export function loadAttendanceFromStorage(): StoredAttendanceRecord[] {
  try {
    const raw = localStorage.getItem(todayKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadAllHistoryFromStorage(): StoredAttendanceRecord[] {
  const all: StoredAttendanceRecord[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const records: StoredAttendanceRecord[] = JSON.parse(raw);
          all.push(...records);
        }
      } catch {
        // skip corrupt entries
      }
    }
  }
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

async function postToScript(body: object): Promise<void> {
  // text/plain;charset=utf-8 avoids CORS preflight on Google Apps Script.
  // redirect: 'follow' ensures the POST body is fully received before redirect.
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  // Response may be opaque after redirect — just check it didn't hard-fail
  if (!response.ok && response.type !== 'opaque') {
    throw new Error(`Script error: ${response.status}`);
  }
}

export async function checkInChild(data: CheckInData): Promise<ActionResponse> {
  await postToScript({
    action: 'checkIn',
    data: {
      childName: data.childName,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      checkInTime: data.checkInTime || getCurrentTime(),
      dropOffPerson: data.dropOffPerson,
    },
  });
  return { success: true };
}

export async function checkOutChild(data: CheckOutData): Promise<ActionResponse> {
  await postToScript({
    action: 'checkOut',
    data: {
      childName: data.childName,
      checkOutTime: data.checkOutTime || getCurrentTime(),
      pickUpPerson: data.pickUpPerson,
    },
  });
  return { success: true };
}

// getAttendanceHistory is replaced by loadAllHistoryFromStorage (localStorage-based)
