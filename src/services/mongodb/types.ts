
// If this file already exists, you'll need to extend it with these types
// If not, create it with these types

export interface MongoUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  certifications?: string[];
  profileImage?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface MongoBooking {
  _id: string;
  userId: string;
  machineId: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: Date;
}

export interface MongoMachineStatus {
  machineId: string;
  status: string;
  note?: string;
  updatedAt?: Date;
}

export interface MongoMachine {
  _id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  requiresCertification: boolean;
  difficulty?: string;
  imageUrl?: string;
  details?: string;
  specifications?: string;
  certificationInstructions?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
  maintenanceNote?: string;
  bookedTimeSlots?: string[];
}

export interface MongoCertification {
  _id: string;
  userId: string;
  machineId: string;
  issuedAt: Date;
  expiresAt?: Date;
}
