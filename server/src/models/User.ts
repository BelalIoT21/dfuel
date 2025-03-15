
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
  createdAt: Date;
  updatedAt: Date;
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
    return;
  }

  try {
    console.log(`Hashing password for user: ${this.email}`);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`Password hashed successfully for user: ${this.email}`);
    next();
  } catch (error) {
    console.error(`Error hashing password: ${error}`);
    next(error);
  }
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  try {
    console.log(`Comparing password for user: ${this.email}`);
    console.log(`Input password length: ${enteredPassword.length}`);
    console.log(`Stored password hash starts with: ${this.password.substring(0, 20)}...`);
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`Password match result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error(`Error comparing password: ${error}`);
    return false;
  }
};

export const User = mongoose.model<IUser>('User', userSchema);
