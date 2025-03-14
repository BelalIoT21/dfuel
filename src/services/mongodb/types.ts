
// MongoDB types
export interface MongoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  certifications: string[];
  bookings: {
    id: string;
    machineId: string;
    date: string;
    time: string;
    status: 'Pending' | 'Approved' | 'Completed' | 'Canceled';
  }[];
  lastLogin: string;
  resetCode?: {
    code: string;
    expiry: string;
  };
}

export interface MongoMachineStatus {
  machineId: string;
  status: string;
  note?: string;
}
