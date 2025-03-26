export interface MongoUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  certifications: string[];
  bookings: string[];
  lastLogin: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoBooking {
  id: string;
  userId: string;
  machineId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoMachine {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'available' | 'maintenance' | 'in-use';
  type: string;
  requiresCertification: boolean;
  certificationInstructions?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
  displayOrder?: number;
}

export interface MongoQuiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
  passingScore: number;
  relatedMachineIds?: string[];
  relatedCourseId?: string;
  difficulty: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoCourse {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  lessons: {
    title: string;
    content: string;
  }[];
  relatedMachineIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
