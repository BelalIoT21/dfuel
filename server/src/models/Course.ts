
import mongoose from 'mongoose';

export interface ICourse extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl?: string;
  relatedMachineIds?: string[];
  quizId?: string;
  difficulty: string;
  deletedAt?: Date;
  backupData?: string; // Add field to store JSON backup of course data
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new mongoose.Schema<ICourse>(
  {
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    relatedMachineIds: {
      type: [String],
      default: [],
    },
    quizId: {
      type: String,
    },
    difficulty: {
      type: String,
      default: 'Beginner',
    },
    deletedAt: {
      type: Date,
    },
    backupData: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model<ICourse>('Course', courseSchema);
