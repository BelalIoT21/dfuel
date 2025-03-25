
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
  details?: string;
  specifications?: string;
  certificationInstructions?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
}

export interface MongoBooking {
  _id?: string;
  user: string;
  machine: string;
  date: Date;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
  userName?: string;
  machineName?: string;
  clientId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoCourse {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl?: string;
  relatedMachineIds?: string[];
  quizId?: string;
  difficulty: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface MongoQuiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  questions: MongoQuizQuestion[];
  passingScore: number;
  relatedMachineIds?: string[];
  relatedCourseId?: string;
  difficulty: string;
  createdAt?: Date;
  updatedAt?: Date;
}
