
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Machine } from '../models/Machine';
import { connectDB } from '../config/db';

// Load environment variables
dotenv.config();

// Function to seed the database with initial data
const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Machine.deleteMany({});

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

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
