
import mongoose from 'mongoose';

export interface IBooking extends mongoose.Document {
  user: mongoose.Types.ObjectId | number | string;
  machine: mongoose.Types.ObjectId | string;
  date: Date;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
  clientId?: string; // Optional client-side ID
  userName?: string; // Added field to store user name
  machineName?: string; // Added field to store machine name
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    user: {
      type: mongoose.Schema.Types.Mixed, // Changed from ObjectId to Mixed to accept numbers and strings
      ref: 'User',
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.Mixed, // Changed from ObjectId to Mixed to accept strings
      ref: 'Machine',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Completed', 'Canceled', 'Rejected'],
      default: 'Pending',
    },
    clientId: {
      type: String,
      index: true, // Add index for faster queries
    },
    userName: {
      type: String,
    },
    machineName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add a method to update the booking status
bookingSchema.statics.updateStatus = async function(bookingId: string, status: string) {
  try {
    // Try to find by MongoDB ID first
    let booking;
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await this.findById(bookingId);
    } else {
      // If not a valid ObjectId, it might be a client-generated ID
      booking = await this.findOne({ clientId: bookingId });
    }
    
    if (!booking) return false;
    
    booking.status = status;
    await booking.save();
    return true;
  } catch (error) {
    console.error('Error in Booking.updateStatus:', error);
    return false;
  }
};

// Add a method to delete a booking by ID
bookingSchema.statics.deleteBookingById = async function(bookingId: string) {
  try {
    // Try to find by MongoDB ID first
    let booking;
    let result;
    
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
      result = await this.findByIdAndDelete(bookingId);
    } else {
      // If not a valid ObjectId, it might be a client-generated ID
      result = await this.findOneAndDelete({ clientId: bookingId });
    }
    
    return !!result; // Return true if a document was deleted, false otherwise
  } catch (error) {
    console.error('Error in Booking.deleteBookingById:', error);
    return false;
  }
};

// Add a method to clear all bookings (admin only)
bookingSchema.statics.clearAllBookings = async function() {
  try {
    const result = await this.deleteMany({});
    console.log(`Cleared all bookings, deleted count: ${result.deletedCount}`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error in Booking.clearAllBookings:', error);
    return 0;
  }
};

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
