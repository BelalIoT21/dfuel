import { Machine } from '../models/Machine';
import User from '../models/User';
import { Booking } from '../models/Booking';
import dotenv from 'dotenv';

dotenv.config();

export class SeedService {
  static async seedDatabase() {
    try {
      console.log('Starting database seeding process...');

      // Only check user and booking counts
      const userCount = await User.countDocuments();
      const bookingCount = await Booking.countDocuments();

      // Always check for missing machines regardless of counts
      await this.checkAndSeedMachines();

      // Only seed users and bookings if none exist
      if (userCount === 0) {
        console.log('No users found, seeding users...');
        await this.seedUsers();
      } else {
        console.log(`${userCount} users already exist, skipping user seeding.`);
      }

      if (bookingCount === 0) {
        console.log('No bookings found, seeding bookings...');
        await this.seedBookings();
      } else {
        console.log(`${bookingCount} bookings already exist, skipping booking seeding.`);
      }

      console.log('Database seeding complete!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  static async checkAndSeedMachines() {
    console.log('Checking machines in database...');
    
    // Define the required machines with their IDs (1-6)
    const requiredMachines = [
      {
        _id: "1",
        name: "Laser Cutter",
        type: "Laser Cutter",
        description: "Professional grade 120W CO2 laser cutter for precision cutting and engraving.",
        status: "Available",
        requiresCertification: true,
        bookedTimeSlots: [],
        difficulty: "Intermediate",
        imageUrl: "/machines/laser-cutter.jpg",
        specifications: "Working area: 32\" x 20\", Power: 120W, Materials: Wood, Acrylic, Paper, Leather"
      },
      {
        _id: "2",
        name: "Ultimaker",
        type: "3D Printer",
        description: "High-precision 3D printer for detailed models and prototypes.",
        status: "Available",
        requiresCertification: true,
        bookedTimeSlots: [],
        difficulty: "Beginner",
        imageUrl: "/machines/ultimaker.jpg",
        specifications: "Build volume: 215 x 215 x 200 mm, Layer resolution: 20 microns, Materials: PLA, ABS, Nylon, TPU"
      },
      {
        _id: "3",
        name: "X1 E Carbon 3D Printer",
        type: "3D Printer",
        description: "High-speed multi-material 3D printer with exceptional print quality.",
        status: "Available",
        requiresCertification: true,
        bookedTimeSlots: [],
        difficulty: "Intermediate",
        imageUrl: "/machines/bambu-printer.jpg",
        specifications: "Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS"
      },
      {
        _id: "4",
        name: "Bambu Lab X1 E",
        type: "3D Printer",
        description: "Next-generation 3D printing technology with advanced features.",
        status: "Available",
        requiresCertification: true,
        bookedTimeSlots: [],
        difficulty: "Advanced",
        imageUrl: "/machines/cnc-mill.jpg",
        specifications: "Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC"
      },
      {
        _id: "5",
        name: "Safety Cabinet",
        type: "Safety Equipment",
        description: "Store hazardous materials safely.",
        status: "Available",
        requiresCertification: true,
        bookedTimeSlots: [],
        difficulty: "Basic",
        imageUrl: "/machines/safety-cabinet.jpg",
        specifications: "Capacity: 30 gallons, Fire resistant: 2 hours"
      },
      {
        _id: "6",
        name: "Safety Course",
        type: "Certification",
        description: "Basic safety training for the makerspace.",
        status: "Available",
        requiresCertification: false,
        bookedTimeSlots: [],
        difficulty: "Basic",
        imageUrl: "/machines/safety-course.jpg",
        specifications: "Duration: 1 hour, Required for all makerspace users"
      }
    ];
    
    // Get existing machine IDs
    const existingMachines = await Machine.find({}, '_id name').lean();
    const existingIds = existingMachines.map(m => m._id.toString());
    
    console.log('Existing machine IDs:', existingIds);
    
    // Find which required machines are missing
    const missingMachines = requiredMachines.filter(
      machine => !existingIds.includes(machine._id)
    );
    
    if (missingMachines.length > 0) {
      console.log(`Missing ${missingMachines.length} machines. Creating them now...`);
      
      // Create the missing machines
      for (const machine of missingMachines) {
        try {
          console.log(`Creating machine: ${machine.name} (ID: ${machine._id})`);
          await Machine.create(machine);
          console.log(`Created machine: ${machine.name}`);
        } catch (error) {
          console.error(`Error creating machine ${machine.name}:`, error);
        }
      }
    } else {
      console.log('All required machines exist in the database.');
    }
    
    // Verify all machines now exist
    const finalCount = await Machine.countDocuments();
    console.log(`Total machines in database after seeding: ${finalCount}`);
  }
  
  static async seedUsers() {
    console.log('Seeding users...');
    const users = [
      {
        _id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      },
      {
        _id: '2',
        username: 'user1',
        email: 'user1@example.com',
        password: 'password1',
        role: 'user'
      },
      {
        _id: '3',
        username: 'user2',
        email: 'user2@example.com',
        password: 'password2',
        role: 'user'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users successfully`);
  }
  
  static async seedBookings() {
    console.log('Seeding bookings...');
    const bookings = [
      {
        _id: '1',
        machineId: '1',
        userId: '1',
        startTime: '2023-01-01T10:00:00Z',
        endTime: '2023-01-01T11:00:00Z'
      },
      {
        _id: '2',
        machineId: '2',
        userId: '2',
        startTime: '2023-01-02T10:00:00Z',
        endTime: '2023-01-02T11:00:00Z'
      },
      {
        _id: '3',
        machineId: '3',
        userId: '3',
        startTime: '2023-01-03T10:00:00Z',
        endTime: '2023-01-03T11:00:00Z'
      }
    ];

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`Created ${createdBookings.length} bookings successfully`);
  }
}
