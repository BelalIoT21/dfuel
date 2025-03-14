
import mongoose from 'mongoose';

export interface IMachine extends mongoose.Document {
  name: string;
  type: string;
  description: string;
  status: 'Available' | 'Maintenance' | 'In Use';
  maintenanceNote?: string;
  requiresCertification: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl?: string;
}

const machineSchema = new mongoose.Schema<IMachine>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Maintenance', 'In Use'],
      default: 'Available',
    },
    maintenanceNote: {
      type: String,
    },
    requiresCertification: {
      type: Boolean,
      default: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Machine = mongoose.model<IMachine>('Machine', machineSchema);
