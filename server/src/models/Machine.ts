
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
  
  // Flag to indicate if machine was created by a user (not a core machine)
  isUserCreated?: boolean;
  
  // Backup and restoration tracking
  deletedAt?: Date;
  permanentlyDeleted?: boolean; // Added flag for permanent deletion
  backupData?: string; // Add field to store JSON backup of machine data
  
  // Methods for manipulating booked time slots
  addBookedTimeSlot(dateTimeSlot: string): Promise<boolean>;
  removeBookedTimeSlot(dateTimeSlot: string): Promise<boolean>;
}

// Helper function to ensure IDs are sequential and start from highest existing ID
async function getNextId(): Promise<string> {
  try {
    // Find the highest numeric ID in the collection
    const machines = await mongoose.model('Machine').find({}, '_id').sort({ _id: -1 }).limit(20);
    
    // Start with ID 7 as base (since IDs 1-6 are reserved for core machines)
    let highestId = 6;
    
    // Find the highest numeric ID
    for (const machine of machines) {
      const idStr = machine._id.toString();
      // Only consider numeric IDs
      if (/^\d+$/.test(idStr)) {
        const idNum = parseInt(idStr, 10);
        if (!isNaN(idNum) && idNum > highestId) {
          highestId = idNum;
        }
      }
    }
    
    // Return the next ID, ensuring it's at least 7
    const nextId = Math.max(highestId + 1, 7);
    console.log(`Generated next machine ID: ${nextId} (from highest: ${highestId})`);
    return nextId.toString();
  } catch (error) {
    console.error('Error generating next machine ID:', error);
    // Fallback to minimum ID 7 if there's an error
    return "7";
  }
}

const machineSchema = new mongoose.Schema<IMachine>(
  {
    _id: {
      type: String,
      required: false, // Set to false to allow auto-generation
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
    // Flag for user-created machines
    isUserCreated: {
      type: Boolean,
      default: false
    },
    // Backup and restoration tracking
    deletedAt: {
      type: Date
    },
    permanentlyDeleted: {
      type: Boolean,
      default: false
    },
    backupData: {
      type: String
    }
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
  try {
    if (this.isNew && (!this._id || this._id === '')) {
      console.log('Generating new ID for machine:', this.name);
      this._id = await getNextId();
      console.log(`Generated new machine ID: ${this._id} for machine: ${this.name}`);
    }
    
    // Ensure requiresCertification is always boolean
    if (this.requiresCertification !== undefined) {
      this.requiresCertification = Boolean(this.requiresCertification);
      console.log(`Normalized requiresCertification for ${this.name}: ${this.requiresCertification} (${typeof this.requiresCertification})`);
    }
    
    // Create a backup of the machine data before saving
    // Only for existing machines (not new ones)
    if (!this.isNew && !this.backupData) {
      const backupData = {
        ...this.toObject(),
        _backupTime: new Date().toISOString()
      };
      this.backupData = JSON.stringify(backupData);
      console.log(`Created backup for machine ${this._id}`);
    }
    
    next();
  } catch (error) {
    console.error('Error in machine pre-save middleware:', error);
    // Convert the unknown error to a proper mongoose error
    if (error instanceof Error) {
      next(new mongoose.Error.ValidationError(error));
    } else {
      next(new Error('Unknown error in pre-save middleware'));
    }
  }
});

export const Machine = mongoose.model<IMachine>('Machine', machineSchema);
