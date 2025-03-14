
// Database and user types

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  certifications: string[];
  bookings: Booking[];
  lastLogin: string;
  resetCode?: {
    code: string;
    expiry: string;
  };
}

export interface Booking {
  id: string;
  machineId: string;
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled';
}

export interface MachineStatus {
  machineId: string;
  status: string;
  note?: string;
  isEquipment?: boolean;
}

export type UserWithoutSensitiveInfo = Omit<User, 'password' | 'resetCode'>;
