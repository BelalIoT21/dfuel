
import mongoose from 'mongoose';

export interface IBooking extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
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
  },
  {
    timestamps: true,
  }
);

// Add a method to update the booking status
bookingSchema.statics.updateStatus = async function(bookingId: string, status: string) {
  try {
    const booking = await this.findById(bookingId);
    if (!booking) return false;
    
    booking.status = status;
    await booking.save();
    return true;
  } catch (error) {
    console.error('Error in Booking.updateStatus:', error);
    return false;
  }
};

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
