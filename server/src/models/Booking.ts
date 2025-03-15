
import mongoose from 'mongoose';

export interface IBooking extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
  clientId?: string; // Optional client-side ID
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
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

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
