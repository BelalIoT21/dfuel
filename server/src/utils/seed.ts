
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Machine } from '../models/Machine';
import { connectDB } from '../config/db';
import { Booking } from '../models/Booking';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Define a type for the booking objects to avoid implicit any arrays
interface BookingSeed {
  user: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Canceled' | 'Rejected';
  clientId?: string;
}

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
      name: 'Bilal Mishmish',
      email: 'b.l.mishmish@gmail.com',
      password: userPassword,
      isAdmin: false,
      certifications: []
    });

    // Create machines with specific types
    console.log('Creating machines...');
    const machines = [
      {
        name: 'Laser Cutter',
        type: 'Laser Cutter',
        description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/laser-cutter.jpg',
        specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather'
      },
      {
        name: 'Ultimaker',
        type: '3D Printer',
        description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/3d-printer.jpg',
        specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU'
      },
      {
        name: 'X1 E Carbon 3D Printer',
        type: '3D Printer',
        description: 'High-speed multi-material 3D printer with exceptional print quality.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/bambu-printer.jpg',
        specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS'
      },
      {
        name: 'Bambu Lab X1 E',
        type: '3D Printer',
        description: 'Next-generation 3D printing technology',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Advanced',
        imageUrl: '/machines/cnc-mill.jpg',
        specifications: 'Work area: 40" x 20" x 25", Materials: Aluminum, Steel, Plastics'
      },
      {
        name: 'Safety Cabinet',
        type: 'Workshop',
        description: 'Full suite of safety equipment and protective gear.',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/machines/woodworking.jpg'
      },
      {
        name: 'Safety Course',
        type: 'Safety Course',
        description: 'Required safety training for all makerspace users.',
        status: 'Available',
        requiresCertification: false,
        difficulty: 'Beginner',
        imageUrl: '/machines/safety.jpg'
      }
    ];

    const createdMachines = await Machine.insertMany(machines);
    console.log(`Created ${createdMachines.length} machines successfully`);

    // Map machine IDs to their IDs for reference (using a properly typed structure)
    const machineMap: Record<string, string> = {};
    createdMachines.forEach(machine => {
      machineMap[machine.name] = machine._id.toString();
    });

    // Add certifications to admin user
    console.log('Adding certifications to admin...');
    adminUser.certifications = createdMachines.map(machine => machine._id.toString());
    await adminUser.save();

    // Add specific certifications to regular user - make sure to include Bambu Lab
    console.log('Adding certifications to regular user...');
    regularUser.certifications = [
      machineMap['Laser Cutter'],
      machineMap['Ultimaker'],
      machineMap['X1 E Carbon 3D Printer'],
      machineMap['Bambu Lab X1 E'], // Include Bambu Lab explicitly
      machineMap['Safety Cabinet'],
      machineMap['Safety Course']
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
    
    // Create bookings using the Booking model with clientId field
    const bookings: BookingSeed[] = [];
    
    // Insert bookings if there are any
    if (bookings.length > 0) {
      await Booking.insertMany(bookings);
    }
    
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
