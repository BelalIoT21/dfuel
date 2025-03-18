
import { Machine } from '../models/Machine';
import User from '../models/User';
import { Booking } from '../models/Booking';
import dotenv from 'dotenv';

dotenv.config();

export class SeedService {
  static async seedDatabase() {
    try {
      console.log('Starting database seeding process...');

      // Check if data already exists
      const userCount = await User.countDocuments();
      const machineCount = await Machine.countDocuments();
      const bookingCount = await Booking.countDocuments();

      if (userCount > 0 && machineCount > 0 && bookingCount > 0) {
        console.log('Database already seeded. Skipping...');
        return;
      }

      // Clear existing data
      console.log('Clearing existing data...');
      await Machine.deleteMany({});

      if (!process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD environment variable is not set');
      }
      
      // Create machines with consistent IDs and names
      console.log('Creating machines...');
      const machines = [
        {
          _id: '1', // Provide a unique ID
          name: 'Laser Cutter',
          type: 'Laser Cutter',
          description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/laser-cutter.jpg',
          specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather',
        },
        {
          _id: '2', // Provide a unique ID
          name: 'Ultimaker',
          type: '3D Printer',
          description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/3d-printer.jpg',
          specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU',
        },
        {
          _id: '3', // Provide a unique ID
          name: 'X1 E Carbon 3D Printer',
          type: '3D Printer',
          description: 'High-speed multi-material 3D printer with exceptional print quality.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/bambu-printer.jpg',
          specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS',
        },
        {
          _id: '4', // Provide a unique ID
          name: 'Bambu Lab X1 E',
          type: '3D Printer',
          description: 'Next-generation 3D printing technology with advanced features.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Advanced',
          imageUrl: '/machines/cnc-mill.jpg',
          specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC',
        },
        {
          _id: '5', // Safety cabinet
          name: 'Safety Cabinet',
          type: 'Safety Equipment',
          description: 'Store hazardous materials safely.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Basic',
          imageUrl: '/machines/safety-cabinet.jpg',
          specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours',
        },
        {
          _id: '6', // Safety course
          name: 'Safety Course',
          type: 'Certification',
          description: 'Basic safety training for the makerspace.',
          status: 'Available',
          requiresCertification: false,
          difficulty: 'Basic',
          imageUrl: '/machines/safety-course.jpg',
          specifications: 'Duration: 1 hour, Required for all makerspace users',
        },
      ];

      const createdMachines = await Machine.insertMany(machines);
      console.log(`Created ${createdMachines.length} machines successfully`);

      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}
