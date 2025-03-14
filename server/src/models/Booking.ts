
import mongoose from 'mongoose';

export interface IBooking extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled';
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
      enum: ['Pending', 'Approved', 'Completed', 'Canceled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
