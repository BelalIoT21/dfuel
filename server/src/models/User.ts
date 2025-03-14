
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  certifications: string[];
  bookings: mongoose.Types.ObjectId[];
  lastLogin: Date;
  resetCode?: {
    code: string;
    expiry: Date;
  };
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    certifications: [{
      type: String,
    }],
    bookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    }],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetCode: {
      code: String,
      expiry: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
