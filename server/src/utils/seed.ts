
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Machine } from '../models/Machine';
import { connectDB } from '../config/db';

// Load environment variables
dotenv.config();

// Function to seed the database with initial data
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding process...');
    
    // Check if data already exists
    const userCount = await User.countDocuments();
    const machineCount = await Machine.countDocuments();
    
    if (userCount > 0 && machineCount > 0) {
      console.log(`Database already contains ${userCount} users and ${machineCount} machines. Skipping seed.`);
      return;
    }

    // Clear existing data if only partial data exists
    if (userCount === 0 || machineCount === 0) {
      console.log('Clearing existing data to ensure consistent seeding...');
      await User.deleteMany({});
      await Machine.deleteMany({});
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
      certifications: []
    });

    // Create regular user
    console.log('Creating regular user...');
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'password123',
      isAdmin: false,
      certifications: []
    });

    // Create machines
    console.log('Creating machines...');
    const machines = [
      {
        name: '3D Printer - Prusa i3',
        type: '3D Printer',
        description: 'A high-quality 3D printer for detailed models.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/3d-printer.jpg'
      },
      {
        name: 'Laser Cutter - Glowforge',
        type: 'Laser Cutter',
        description: 'Precision laser cutter for various materials.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Advanced',
        imageUrl: '/machines/laser-cutter.jpg'
      },
      {
        name: 'CNC Router - Shapeoko',
        type: 'CNC Router',
        description: 'CNC router for wood and soft metals.',
        status: 'Maintenance',
        requiresCertification: true,
        difficulty: 'Advanced',
        maintenanceNote: 'Replacing spindle motor. Expected back online on Friday.',
        imageUrl: '/machines/cnc-router.jpg'
      },
      {
        name: 'Sewing Machine - Industrial',
        type: 'Sewing Machine',
        description: 'Industrial sewing machine for heavy fabrics.',
        status: 'Available',
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: '/machines/sewing-machine.jpg'
      },
      {
        name: 'Soldering Station',
        type: 'Electronics',
        description: 'Professional soldering station for electronics work.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/soldering-station.jpg'
      }
    ];

    const createdMachines = await Machine.insertMany(machines);

    // Add certifications to admin user
    console.log('Adding certifications to admin...');
    adminUser.certifications = createdMachines.map(machine => machine._id.toString());
    await adminUser.save();

    // Add some certifications to regular user
    console.log('Adding certifications to regular user...');
    regularUser.certifications = [
      createdMachines[0]._id.toString(), // 3D Printer
      createdMachines[3]._id.toString()  // Sewing Machine
    ];
    await regularUser.save();

    // Create some bookings
    console.log('Creating sample bookings...');
    
    // Get today and future dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Create bookings in the User model (embedded bookings)
    regularUser.bookings = [
      {
        machineId: createdMachines[0]._id.toString(), // 3D Printer
        date: formatDate(today),
        time: '10:00 - 12:00',
        status: 'Approved'
      },
      {
        machineId: createdMachines[1]._id.toString(), // Laser Cutter
        date: formatDate(tomorrow),
        time: '14:00 - 16:00',
        status: 'Pending'
      },
      {
        machineId: createdMachines[2]._id.toString(), // CNC Router
        date: formatDate(nextWeek),
        time: '09:00 - 11:00',
        status: 'Pending'
      }
    ];
    
    await regularUser.save();
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error; // Re-throw to be caught by the caller
  }
};

// If this script is run directly (not imported)
if (require.main === module) {
  // Connect to the database and seed it
  connectDB()
    .then(seedDatabase)
    .then(() => {
      console.log('Seeding completed, exiting process');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
