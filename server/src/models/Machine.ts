
import mongoose from 'mongoose';

export interface IMachine extends mongoose.Document {
  name: string;
  type: string;
  description: string;
  status: 'Available' | 'Maintenance' | 'Out of Order';
  requiresCertification: boolean;
  maintenanceNote?: string;
  bookedTimeSlots: string[]; // Format: YYYY-MM-DD-HH:MM
  
  // Add a method to add and remove booked time slots
  addBookedTimeSlot(dateTimeSlot: string): Promise<boolean>;
  removeBookedTimeSlot(dateTimeSlot: string): Promise<boolean>;
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

// Add methods to the schema
machineSchema.methods.addBookedTimeSlot = async function(dateTimeSlot: string): Promise<boolean> {
  try {
    if (!this.bookedTimeSlots.includes(dateTimeSlot)) {
      this.bookedTimeSlots.push(dateTimeSlot);
      await this.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding booked time slot:', error);
    return false;
  }
};

machineSchema.methods.removeBookedTimeSlot = async function(dateTimeSlot: string): Promise<boolean> {
  try {
    const index = this.bookedTimeSlots.indexOf(dateTimeSlot);
    if (index !== -1) {
      this.bookedTimeSlots.splice(index, 1);
      await this.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing booked time slot:', error);
    return false;
  }
};

export const Machine = mongoose.model<IMachine>('Machine', machineSchema);
