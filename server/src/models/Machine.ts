
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
  
  // Enhanced machine information
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

// Helper function to ensure IDs are sequential and start from highest existing ID
async function getNextId(): Promise<string> {
  try {
    // Find the highest numeric ID in the collection
    const machines = await mongoose.model('Machine').find({}, '_id').sort({ _id: -1 }).limit(10);
    
    // Start with ID 5 as base (since you mentioned special IDs like 5 and 6)
    let highestId = 4;
    
    // Find the highest numeric ID
    for (const machine of machines) {
      const idNum = parseInt(machine._id.toString(), 10);
      if (!isNaN(idNum) && idNum > highestId) {
        highestId = idNum;
      }
    }
    
    // Return the next ID
    return (highestId + 1).toString();
  } catch (error) {
    console.error('Error generating next machine ID:', error);
    // Fallback to timestamp-based ID if there's an error
    return Date.now().toString();
  }
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
    // Enhanced machine information
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

// Modified to properly handle machine time slots
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

// Add pre-save middleware to handle ID generation for new documents
machineSchema.pre('save', async function(next) {
  if (this.isNew && !this._id) {
    this._id = await getNextId();
    console.log(`Generated new machine ID: ${this._id}`);
  }
  next();
});

export const Machine = mongoose.model<IMachine>('Machine', machineSchema);
