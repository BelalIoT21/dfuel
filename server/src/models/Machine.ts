
import mongoose from 'mongoose';

export interface IMachine extends mongoose.Document {
  name: string;
  type: string;
  description: string;
  status: 'Available' | 'Maintenance' | 'Out of Order';
  requiresCertification: boolean;
  maintenanceNote?: string;
  bookedTimeSlots: string[]; // Format: YYYY-MM-DD-HH:MM
}

const machineSchema = new mongoose.Schema<IMachine>(
  {
    name: {
      type: String,
      required: true,
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
      enum: ['Available', 'Maintenance', 'Out of Order'],
      default: 'Available',
    },
    requiresCertification: {
      type: Boolean,
      default: false,
    },
    maintenanceNote: {
      type: String,
    },
    bookedTimeSlots: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Machine = mongoose.model<IMachine>('Machine', machineSchema);
