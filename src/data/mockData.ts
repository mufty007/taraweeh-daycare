import { Child, AttendanceRecord } from '@/types/attendance';

export const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Aisha Ahmad',
    parentName: 'Fatima Ahmad',
    parentPhone: '(555) 123-4567',
    parentEmail: 'fatima@email.com',
    allergiesNotes: 'Peanut allergy',
  },
  {
    id: '2',
    name: 'Omar Hassan',
    parentName: 'Yusuf Hassan',
    parentPhone: '(555) 234-5678',
    parentEmail: 'yusuf@email.com',
    allergiesNotes: 'None',
  },
  {
    id: '3',
    name: 'Layla Khan',
    parentName: 'Sara Khan',
    parentPhone: '(555) 345-6789',
    parentEmail: 'sara@email.com',
    allergiesNotes: 'Lactose intolerant',
  },
  {
    id: '4',
    name: 'Adam Ali',
    parentName: 'Maryam Ali',
    parentPhone: '(555) 456-7890',
    parentEmail: 'maryam@email.com',
    allergiesNotes: 'None',
  },
  {
    id: '5',
    name: 'Zara Ibrahim',
    parentName: 'Ahmed Ibrahim',
    parentPhone: '(555) 567-8901',
    parentEmail: 'ahmed@email.com',
    allergiesNotes: 'Asthma - has inhaler',
  },
  {
    id: '6',
    name: 'Khalid Malik',
    parentName: 'Amina Malik',
    parentPhone: '(555) 678-9012',
    parentEmail: 'amina@email.com',
    allergiesNotes: 'None',
  },
];

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
