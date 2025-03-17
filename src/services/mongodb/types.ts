
export interface MongoUser {
  _id?: string;
  id?: string;
  email: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  certifications?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoMachine {
  _id: string;
  name: string;
  type: string;
  description: string;
  status?: string;
  requiresCertification?: boolean;
  maintenanceNote?: string;
  difficulty?: string;
  imageUrl?: string;
  bookedTimeSlots?: string[];
  details?: string;
  specifications?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoMachineStatus {
  _id?: string;
  machineId: string;
  status: string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoCertification {
  _id?: string;
  userId: string;
  machineId: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoBooking {
  _id?: string;
  userId: string;
  userName?: string;  // Added userName field
  machineId: string;
  machineName?: string;  // Added machineName field
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
  createdAt?: Date;
  updatedAt?: Date;
}
