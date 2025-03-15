
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
    status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
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

export interface MongoMachine {
  _id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  requiresCertification: boolean;
  difficulty: string;
  maintenanceNote?: string;
  imageUrl?: string;
}
