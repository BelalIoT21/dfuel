
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

    // Create regular user - commented out as requested
    /*
    console.log('Creating regular user...');
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'password123',
      isAdmin: false,
      certifications: []
    });
    */

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
        type: 'Machine',
        description: 'Ultimaker 3D printer for precise prototyping and modeling.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/3d-printer.jpg'
      },
      {
        name: 'X1 E Carbon 3D Printer',
        type: 'Machine',
        description: 'Advanced 3D printer for carbon fiber composites.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Advanced',
        imageUrl: '/machines/carbon-printer.jpg'
      },
      {
        name: 'Bambu Lab X1 E',
        type: 'Machine',
        description: 'High-speed multi-material 3D printer with exceptional print quality.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/bambu-printer.jpg'
      },
      {
        name: 'Soldering Station',
        type: 'Machine',
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

    /* Removed as requested
    // Add some certifications to regular user
    console.log('Adding certifications to regular user...');
    regularUser.certifications = [
      createdMachines[0]._id.toString(), // Laser Cutter
      createdMachines[1]._id.toString(), // Ultimaker
      createdMachines[2]._id.toString(), // X1 E Carbon 3D Printer
      createdMachines[3]._id.toString()  // Bambu Lab X1 E
    ];
    await regularUser.save();
    */

    // Bookings have been removed as requested
    
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

