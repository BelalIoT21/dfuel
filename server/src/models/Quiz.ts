
import mongoose from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IQuiz extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  questions: IQuizQuestion[];
  passingScore: number;
  relatedMachineIds?: string[];
  relatedCourseId?: string;
  difficulty: string;
  deletedAt?: Date;
  permanentlyDeleted?: boolean; // New flag for permanent deletion
  backupData?: string; // Add field to store JSON backup of quiz data
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new mongoose.Schema<IQuiz>(
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
    imageUrl: {
      type: String,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
          validate: {
            validator: function(v: string[]) {
              return v.length >= 2;
            },
            message: 'Quiz must have at least 2 options'
          }
        },
        correctAnswer: {
          type: Number,
          required: true,
        },
        explanation: {
          type: String,
        },
      },
    ],
    passingScore: {
      type: Number,
      default: 70,
    },
    relatedMachineIds: {
      type: [String],
      default: [],
    },
    relatedCourseId: {
      type: String,
    },
    difficulty: {
      type: String,
      default: 'Beginner',
    },
    deletedAt: {
      type: Date,
    },
    permanentlyDeleted: {
      type: Boolean,
      default: false
    },
    backupData: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
