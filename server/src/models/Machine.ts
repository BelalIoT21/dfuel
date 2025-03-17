
import mongoose from 'mongoose';

export interface IMachine extends mongoose.Document {
  _id: string;
  name: string;
  type: string;
  description: string;
  status: 'Available' | 'Maintenance' | 'In Use';
  requiresCertification: boolean;
  maintenanceNote?: string;
  bookedTimeSlots: string[]; // Format: YYYY-MM-DD-HH:MM
  difficulty?: string;
  imageUrl?: string;
  
  // New fields for enhanced machine information
  details?: string;
  specifications?: string;
  certificationInstructions?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
  note?: string;
  
  // Methods for manipulating booked time slots
  addBookedTimeSlot(dateTimeSlot: string): Promise<boolean>;
  removeBookedTimeSlot(dateTimeSlot: string): Promise<boolean>;
}

const machineSchema = new mongoose.Schema<IMachine>(
  {
    _id: {
      type: String,
      required: true,
    },
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
      enum: ['Available', 'Maintenance', 'In Use'],
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
    difficulty: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    // New fields for enhanced machine information
    details: {
      type: String,
    },
    specifications: {
      type: String,
    },
    certificationInstructions: {
      type: String,
    },
    linkedCourseId: {
      type: String,
    },
    linkedQuizId: {
      type: String,
    },
    note: {
      type: String,
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
      console.log(`Added time slot ${dateTimeSlot} to machine ${this.name}`);
      return true;
    }
    console.log(`Time slot ${dateTimeSlot} already booked for machine ${this.name}`);
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
      console.log(`Removed time slot ${dateTimeSlot} from machine ${this.name}`);
      return true;
    }
    console.log(`Time slot ${dateTimeSlot} not found for machine ${this.name}`);
    return false;
  } catch (error) {
    console.error('Error removing booked time slot:', error);
    return false;
  }
};

export const Machine = mongoose.model<IMachine>('Machine', machineSchema);
