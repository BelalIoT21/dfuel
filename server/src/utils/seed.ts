
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
    const bookingCount = await Booking.countDocuments();
    
    if (userCount > 0 && machineCount > 0 && bookingCount > 0) {
      console.log(`Database already contains ${userCount} users, ${machineCount} machines, and ${bookingCount} bookings. Skipping seed.`);
      return;
    }

    // Clear existing data if only partial data exists
    if (userCount === 0 || machineCount === 0 || bookingCount === 0) {
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

    // Create regular user
    console.log('Creating regular user...');
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'password123',
      isAdmin: false,
      certifications: []
    });

    // Create machines with specific names matching the image
    console.log('Creating machines...');
    const machines = [
      {
        name: 'Laser Cutter',
        type: '3D Printer',
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
      createdMachines[0]._id.toString(), // Laser Cutter
      createdMachines[1]._id.toString(), // Ultimaker
      createdMachines[2]._id.toString(), // X1 E Carbon 3D Printer
      createdMachines[3]._id.toString()  // Bambu Lab X1 E
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
    
    // Format dates as YYYY-MM-DD with proper type annotation
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };
    
    // Create bookings using the Booking model with clientId field
    const bookings = [
      {
        user: regularUser._id,
        machine: createdMachines[0]._id,
        date: today,
        time: '10:00 - 12:00',
        status: 'Approved',
        clientId: `booking-${Date.now() - 100000}` // Add a clientId for client compatibility
      },
      {
        user: regularUser._id,
        machine: createdMachines[1]._id,
        date: tomorrow,
        time: '14:00 - 16:00',
        status: 'Pending',
        clientId: `booking-${Date.now() - 50000}` // Add a clientId for client compatibility
      },
      {
        user: regularUser._id,
        machine: createdMachines[2]._id,
        date: nextWeek,
        time: '09:00 - 11:00',
        status: 'Pending',
        clientId: `booking-${Date.now()}` // Add a clientId for client compatibility
      }
    ];
    
    // Insert bookings
    await Booking.insertMany(bookings);
    
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
