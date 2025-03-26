
import { Collection, Document, ObjectId } from 'mongodb';

export interface MongoUser extends Document {
  id: string;
  _id?: string | ObjectId;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  certifications: string[];
  certificationDates?: Record<string, Date>;
  bookings: any[];
  lastLogin: string;
}

export interface MongoMachine extends Document {
  _id: string | ObjectId;
  id?: string;
  name: string;
  type?: string;
  description?: string;
  specifications?: string;
  status?: string;
  maintenanceNote?: string;
  imageUrl?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
  requiresCertification?: boolean;
}

export interface MongoQuiz extends Document {
  _id: string | ObjectId;
  id?: string;
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
}

export interface MongoCourse extends Document {
  _id: string | ObjectId;
  id?: string;
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl?: string;
  relatedMachineIds?: string[];
  quizId?: string;
  difficulty: string;
}
