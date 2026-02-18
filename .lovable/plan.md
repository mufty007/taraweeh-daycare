
## Fixing History & Check-in/Check-out Status

### Problems Diagnosed

**Problem 1 — History page shows nothing:**
The `getAttendanceHistory()` function calls `?action=getAttendance` on the Google Apps Script, but the script returns `{"error":"Invalid action"}` for that endpoint. The history page fetches this, gets no data, and shows "No attendance records found."

**Problem 2 — Check-in/checkout status lost on refresh:**
For the same reason — `getTodayAttendance()` also calls `?action=getAttendance` which returns `{"error":"Invalid action"}`. On every page load, `todayRecords` starts empty because the server response has an error. Status only appears correct while you're on the page (optimistic local state), but is wiped on refresh.

### Root Cause

The Google Apps Script does not support a `getAttendance` action. The only confirmed working action is `getChildren` (verified in the network requests — returns 200 with real data).

### Fix Plan

Since we cannot change the Google Apps Script backend, we will:

**1. Store attendance state in `localStorage`**
- After every check-in or check-out, save `todayRecords` to `localStorage` keyed by today's date (e.g., `attendance_2026-02-18`)
- On page load, read from `localStorage` first instead of relying on the broken API call
- Auto-clear old dates so storage doesn't grow indefinitely
- This means status correctly persists across refreshes and browser sessions for the same day

**2. Fix the History page**
- Read all saved daily attendance records from `localStorage` (all date keys)
- Display them grouped by date — this gives a real, growing history as each day's data is saved locally
- Remove the broken `getAttendanceHistory` API call entirely
- Add a note that history reflects locally saved records

**3. Remove the broken `getTodayAttendance` API call**
- Remove the call to `?action=getAttendance` since it always errors
- `useAttendance.ts` will no longer call `getTodayAttendance()` on load — instead it reads from localStorage

### Technical Details

**Files to change:**

- `src/services/googleSheetsApi.ts` — Remove `getTodayAttendance` and `getAttendanceHistory` (both broken). Add localStorage utility functions: `saveAttendanceToStorage`, `loadAttendanceFromStorage`, `loadAllHistoryFromStorage`
- `src/hooks/useAttendance.ts` — Replace `getTodayAttendance()` fetch with localStorage read on init. After every `checkIn`/`checkOut`, persist to localStorage
- `src/pages/History.tsx` — Replace the API fetch with a direct `loadAllHistoryFromStorage()` call

**localStorage key format:**
```
attendance_YYYY-MM-DD → AttendanceRecord[]
```

**Data flow after fix:**

```text
Page load
  ├── Fetch children from Google Sheets (already works ✓)
  └── Load today's records from localStorage (new, replaces broken API)

Check In / Check Out
  ├── Optimistic UI update (already works ✓)
  ├── POST to Google Sheets API (already works ✓)
  └── Save updated records to localStorage (new)

History page
  └── Read all date keys from localStorage and display (new, replaces broken API)
```

This approach requires no changes to the Google Apps Script and makes the app work reliably immediately.
