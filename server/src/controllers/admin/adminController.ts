
import { Request, Response } from 'express';
import User from '../../models/User';
import { Booking } from '../../models/Booking';
import { Machine } from '../../models/Machine';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// function to create the admin user
export const createAdminUser = async () => {
  try {
    console.log('Starting admin user creation process...');
    
    // Check if any users exist
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('Looking for admin with email:', adminEmail);
    
    if (!adminEmail) {
      console.error('ADMIN_EMAIL is not defined in environment variables');
      return;
    }

    // Check specifically for admin user
    const adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      console.log('Admin user already exists:', adminEmail);
      
      // Check if admin user has all certifications
      if (!adminUser.certifications || adminUser.certifications.length < 6) {
        adminUser.certifications = ['1', '2', '3', '4', '5', '6'];
        await adminUser.save();
        console.log('Updated admin user with all certifications');
      }
      
      // Ensure admin flag is set
      if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        await adminUser.save();
        console.log('Ensured admin flag is set');
      }
      return;
    }

    // Get admin details from environment variables
    console.log('Creating new admin user with email:', adminEmail);
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD is not defined in environment variables');
    }

    // Create admin user with all certifications
    const newAdminUser = new User({
      _id: '1', // Use string type for consistency
      name: 'Admin',
      email: adminEmail,
      password: adminPassword, // Will be hashed by pre-save hook
      isAdmin: true,
      certifications: ['1', '2', '3', '4', '5', '6'], // Ensure all six certifications
    });

    await newAdminUser.save();
    console.log('Admin user created successfully:', newAdminUser.email);
    console.log('Admin certifications:', newAdminUser.certifications);
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
    
    // Filter out special machines (5 and 6) for consistent count
    const machinesCount = await Machine.countDocuments({
      _id: { $nin: ['5', '6'] }
    });
    
    const bookingsCount = await Booking.countDocuments();
    
    // Get count of each machine status
    const machineStatuses = await Machine.aggregate([
      {
        $match: { 
          _id: { $nin: ['5', '6'] } 
        }
      },
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
    
    // Update the admin user in the database
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    
    // Update the admin user
    if (email) {
      adminUser.email = email;
      
      // Also update the .env file
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          envContent = envContent.replace(/ADMIN_EMAIL=.*/g, `ADMIN_EMAIL=${email}`);
          fs.writeFileSync(envPath, envContent);
          console.log('Updated ADMIN_EMAIL in .env file');
        }
      } catch (err) {
        console.error('Error updating .env file:', err);
      }
      
      // Update process.env
      process.env.ADMIN_EMAIL = email;
    }
    
    if (password) {
      adminUser.password = password; // Will be hashed by the pre-save hook
      
      // Also update the .env file
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          envContent = envContent.replace(/ADMIN_PASSWORD=.*/g, `ADMIN_PASSWORD=${password}`);
          fs.writeFileSync(envPath, envContent);
          console.log('Updated ADMIN_PASSWORD in .env file');
        }
      } catch (err) {
        console.error('Error updating .env file:', err);
      }
      
      // Update process.env
      process.env.ADMIN_PASSWORD = password;
    }
    
    await adminUser.save();
    
    res.json({ 
      message: 'Admin credentials updated',
      email: adminUser.email,
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
    // Check if admin user already exists
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      res.status(400).json({
        message: 'ADMIN_EMAIL is not defined in environment variables'
      });
      return;
    }
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      res.status(400).json({ 
        message: 'Admin user already exists',
        adminEmail: existingAdmin.email
      });
      return;
    }

    // Get admin details from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      res.status(400).json({
        message: 'ADMIN_PASSWORD is not defined in environment variables'
      });
      return;
    }
    
    // Create admin user with all certifications
    const adminUser = new User({
      _id: '1', // Use string type for consistency
      name: 'Admin',
      email: adminEmail,
      password: adminPassword, // Will be hashed by pre-save hook
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
export const updateMachineCourseLinks = async (req: Request, res: Response) => {
  try {
    // Default course and quiz mappings with explicit type declaration and string index signature
    const defaultLinks: Record<string, { courseId: string; quizId: string }> = {
      '1': { courseId: '1', quizId: '1' }, // Ensure machine 1 has course 1 and quiz 1
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
      // Use defaultLinks with proper typesafe index access
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
};
