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
      
      // Create machines
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
          description: 'Next-generation 3D printing technology',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Advanced',
          imageUrl: '/machines/cnc-mill.jpg',
          specifications: 'Work area: 40" x 20" x 25", Materials: Aluminum, Steel, Plastics',
        },
        {
          _id: '5', // Provide a unique ID
          name: 'Safety Cabinet',
          type: 'Workshop',
          description: 'Full suite of safety equipment and protective gear.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/woodworking.jpg',
        },
        {
          _id: '6', // Provide a unique ID
          name: 'Safety Course',
          type: 'Safety Course',
          description: 'Required safety training for all makerspace users.',
          status: 'Available',
          requiresCertification: false,
          difficulty: 'Beginner',
          imageUrl: '/machines/safety.jpg',
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