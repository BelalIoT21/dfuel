
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Machine } from '../models/Machine';
import { connectDB } from '../config/db';
import { Booking } from '../models/Booking';
import bcrypt from 'bcryptjs';

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

    // Generate a proper password hash for security
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);
    const userPassword = await bcrypt.hash('password123', salt);

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    
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
      password: userPassword,
      isAdmin: false,
      certifications: []
    });

    // Create test user
    console.log('Creating test user...');
    const testUser = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      isAdmin: false,
      certifications: []
    });

    // Create machines with specific types
    console.log('Creating machines...');
    const machines = [
      {
        name: 'Epilog Laser Cutter',
        type: 'Laser Cutter',
        description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/laser-cutter.jpg',
        specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather'
      },
      {
        name: 'Ultimaker S5',
        type: '3D Printer',
        description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/3d-printer.jpg',
        specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU'
      },
      {
        name: 'Machine Safety Course',
        type: 'Safety Course',
        description: 'Required safety training for all makerspace users.',
        status: 'Available',
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: '/machines/safety.jpg'
      },
      {
        name: 'HAAS CNC Mill',
        type: 'CNC Machine',
        description: 'Industrial CNC milling machine for precision metalworking.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Advanced',
        imageUrl: '/machines/cnc-mill.jpg',
        specifications: 'Work area: 40" x 20" x 25", Materials: Aluminum, Steel, Plastics'
      },
      {
        name: 'Bambu Lab X1 Carbon',
        type: '3D Printer',
        description: 'High-speed multi-material 3D printer with exceptional print quality.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/bambu-printer.jpg',
        specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS'
      },
      {
        name: 'Soldering Station',
        type: 'Electronics',
        description: 'Professional soldering station for electronics work.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/soldering-station.jpg',
        specifications: 'Temperature range: 200°C-450°C, Digital control, ESD safe'
      },
      {
        name: 'Vinyl Cutter',
        type: 'Cutting',
        description: 'Precision vinyl cutter for signs, stickers, and heat transfers.',
        status: 'Maintenance',
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: '/machines/vinyl-cutter.jpg',
        maintenanceNote: 'Replacing cutting blade, available next week.',
        specifications: 'Cutting width: 24", Materials: Vinyl, Paper, Heat Transfer Vinyl'
      },
      {
        name: 'Woodworking Tools',
        type: 'Workshop',
        description: 'Full suite of woodworking hand tools and power tools.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/woodworking.jpg'
      }
    ];

    const createdMachines = await Machine.insertMany(machines);
    console.log(`Created ${createdMachines.length} machines successfully`);

    // Map machine names to their IDs for reference
    const machineMap = {};
    createdMachines.forEach(machine => {
      machineMap[machine.name] = machine._id.toString();
    });

    // Add certifications to admin user
    console.log('Adding certifications to admin...');
    adminUser.certifications = createdMachines.map(machine => machine._id.toString());
    await adminUser.save();

    // Add specific certifications to regular user
    console.log('Adding certifications to regular user...');
    regularUser.certifications = [
      machineMap['Epilog Laser Cutter'],
      machineMap['Ultimaker S5'],
      machineMap['Machine Safety Course'],
      machineMap['Bambu Lab X1 Carbon']
    ];
    await regularUser.save();

    // Add different certifications to test user
    console.log('Adding certifications to test user...');
    testUser.certifications = [
      machineMap['Machine Safety Course'],
      machineMap['Soldering Station'],
      machineMap['Woodworking Tools']
    ];
    await testUser.save();

    // Create some bookings
    console.log('Creating sample bookings...');
    
    // Get today and future dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Create bookings using the Booking model with clientId field
    const bookings = [
      {
        user: regularUser._id,
        machine: machineMap['Epilog Laser Cutter'],
        date: today,
        time: '10:00 - 12:00',
        status: 'Approved',
        clientId: `booking-${Date.now() - 100000}` // Add a clientId for client compatibility
      },
      {
        user: regularUser._id,
        machine: machineMap['Ultimaker S5'],
        date: tomorrow,
        time: '14:00 - 16:00',
        status: 'Pending',
        clientId: `booking-${Date.now() - 50000}` // Add a clientId for client compatibility
      },
      {
        user: testUser._id,
        machine: machineMap['Soldering Station'],
        date: today,
        time: '13:00 - 15:00',
        status: 'Approved',
        clientId: `booking-${Date.now() - 25000}`
      },
      {
        user: testUser._id,
        machine: machineMap['Bambu Lab X1 Carbon'],
        date: nextWeek,
        time: '09:00 - 11:00',
        status: 'Pending',
        clientId: `booking-${Date.now()}`
      }
    ];
    
    // Insert bookings
    await Booking.insertMany(bookings);
    
    console.log('Database seeded successfully!');
    // Display summary of what was created
    console.log(`Created ${await User.countDocuments()} users`);
    console.log(`Created ${await Machine.countDocuments()} machines`);
    console.log(`Created ${await Booking.countDocuments()} bookings`);
    
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
