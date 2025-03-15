
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Machine } from '../models/Machine';
import { connectDB } from '../config/db';
import { Booking } from '../models/Booking';

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
      await Booking.deleteMany({});
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Creating admin user...');
    const adminUser = await User.create({
      name: 'Administrator',
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
      certifications: []
    });

    // Create machines with specific types
    console.log('Creating machines...');
    const machines = [
      {
        name: 'Laser Cutter',
        type: 'Machine',
        description: 'A high-quality laser cutter for detailed cutting projects.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/laser-cutter.jpg'
      },
      {
        name: 'Ultimaker',
        type: '3D Printer',
        description: 'Ultimaker 3D printer for precise prototyping and modeling.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/3d-printer.jpg'
      },
      {
        name: 'Safety Cabinet',
        type: 'Safety Cabinet',
        description: 'Safety equipment storage cabinet.',
        status: 'Available',
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: '/machines/safety-cabinet.jpg'
      },
      {
        name: 'X1 E Carbon 3D Printer',
        type: '3D Printer',
        description: 'Advanced 3D printer for carbon fiber composites.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Advanced',
        imageUrl: '/machines/carbon-printer.jpg'
      },
      {
        name: 'Bambu Lab X1 E',
        type: '3D Printer',
        description: 'High-speed multi-material 3D printer with exceptional print quality.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/bambu-printer.jpg'
      },
      {
        name: 'Machine Safety Course',
        type: 'Safety Course',
        description: 'Required safety training for using machines.',
        status: 'Available',
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: '/machines/safety-course.jpg'
      }
    ];

    const createdMachines = await Machine.insertMany(machines);

    // Add certifications to admin user
    console.log('Adding certifications to admin...');
    adminUser.certifications = createdMachines.map(machine => machine._id.toString());
    await adminUser.save();
    
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
