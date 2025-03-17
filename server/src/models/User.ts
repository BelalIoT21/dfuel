
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  _id: number;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  certifications: string[];
  bookings: mongoose.Types.ObjectId[];
  resetCode?: {
    code: string;
    expiry: Date;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  certificationDates?: {
    [machineId: string]: Date;
  };
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    certifications: { type: [String], default: [] },
    resetCode: {
      code: String,
      expiry: Date,
    },
    lastLogin: { type: Date },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    certificationDates: {
      type: Map,
      of: Date,
      default: {}
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
