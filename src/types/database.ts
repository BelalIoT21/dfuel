
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
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
}

export interface MachineStatus {
  machineId: string;
  status: string;
  note?: string;
}

export interface MongoUser {
  id: string;
  name: string;
  email: string;
  certifications: string[];
  bookings?: any[];
}

export type UserWithoutSensitiveInfo = Omit<User, 'password' | 'resetCode'>;
