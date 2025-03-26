import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Machine } from '../models/Machine';
import dotenv from 'dotenv';

dotenv.config();

// function to create the admin user
export const createAdminUser = async () => {
  try {
    // Check if any users exist
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      console.log('Seed already completed. Admin user already exists.');
      // Check if admin user has all certifications
      const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (adminUser && (!adminUser.certifications || adminUser.certifications.length < 6)) {
        adminUser.certifications = ['1', '2', '3', '4', '5', '6'];
        await adminUser.save();
        console.log('Updated admin user with all certifications');
      }
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD is not defined in environment variables');
    }

    // Create admin user from .env credentials with all certifications
    const adminUser = new User({
      _id: '1',
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: adminPassword,
      isAdmin: true,
      certifications: ['1', '2', '3', '4', '5', '6'], // Ensure all six certifications
    });

    await adminUser.save();
    console.log('Admin user created successfully:', adminUser.email);
    console.log('Admin certifications:', adminUser.certifications);
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    throw error; // Re-throw the error for handling elsewhere
  }
};

// @desc    Get dashboard overview data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // Get count of users, machines, and bookings
    const usersCount = await User.countDocuments();
    const machinesCount = await Machine.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    
    // Get count of each machine status
    const machineStatuses = await Machine.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('machine', 'name');
    
    // Get pending bookings count
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password -resetCode');
    
    res.json({
      counts: {
        users: usersCount,
        machines: machinesCount,
        bookings: bookingsCount,
        pendingBookings
      },
      machineStatuses,
      recentBookings,
      recentUsers
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Update admin credentials
// @route   PUT /api/admin/credentials
// @access  Private/Admin
export const updateAdminCredentials = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email && !password) {
      return res.status(400).json({ message: 'Email or password is required' });
    }
    
    // Update .env file
    if (email) {
      process.env.ADMIN_EMAIL = email;
    }
    
    if (password) {
      process.env.ADMIN_PASSWORD = password;
    }
    
    // In a real app, we would update the .env file on disk
    // For this demo, we'll just update the process.env
    
    res.json({ 
      message: 'Admin credentials updated',
      email: process.env.ADMIN_EMAIL,
      passwordUpdated: !!password
    });
  } catch (error) {
    console.error('Error in updateAdminCredentials:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Seed initial admin user
// @route   POST /api/admin/seed
// @access  Public (only available during setup)
export const seedAdminUser = async (req: Request, res: Response) => {
  try {
    // Check if any users exist
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return res.status(400).json({ 
        message: 'Seed already completed. Admin user already exists.' 
      });
    }

    if (!process.env.ADMIN_PASSWORD) {
      throw new Error('ADMIN_PASSWORD is not defined in environment variables');
    }
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    
    // Create admin user from .env credentials with all certifications
    const adminUser = new User({
      _id: '1',
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: adminPassword,
      isAdmin: true,
      certifications: ['1', '2', '3', '4', '5', '6'] // Give admin all certifications
    });
    
    await adminUser.save();
    
    res.status(201).json({ 
      message: 'Admin user created successfully',
      email: adminUser.email,
      certifications: adminUser.certifications
    });
  } catch (error) {
    console.error('Error in seedAdminUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Controller to update all machine course/quiz links
export const updateMachineCourseLinks = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Default course and quiz mappings
    const defaultLinks = {
      '1': { courseId: '5', quizId: '100' },
      '2': { courseId: '2', quizId: '2' },
      '3': { courseId: '3', quizId: '3' },
      '4': { courseId: '4', quizId: '4' },
      '5': { courseId: '5', quizId: '5' },
      '6': { courseId: '6', quizId: '6' }
    };
    
    console.log("Updating all machine course and quiz links...");
    
    // Get all machines
    const machines = await Machine.find();
    let updatedCount = 0;
    
    // Update each machine
    for (const machine of machines) {
      const machineId = machine._id.toString();
      const link = defaultLinks[machineId] || { courseId: machineId, quizId: machineId };
      
      if (!machine.linkedCourseId || !machine.linkedQuizId) {
        machine.linkedCourseId = machine.linkedCourseId || link.courseId;
        machine.linkedQuizId = machine.linkedQuizId || link.quizId;
        await machine.save();
        updatedCount++;
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Updated ${updatedCount} machines with course and quiz links`
    });
  } catch (error) {
    console.error('Error updating machine course/quiz links:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update machine links', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
