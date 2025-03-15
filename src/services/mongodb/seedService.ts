
import { Collection } from 'mongodb';
import { MongoUser, MongoMachine } from './types';
import mongoConnectionService from './connectionService';
import bcrypt from 'bcryptjs';

class MongoSeedService {
  private usersCollection: Collection<MongoUser> | null = null;
  private machinesCollection: Collection<MongoMachine> | null = null;
  
  async initCollections(): Promise<void> {
    try {
      if (!this.usersCollection || !this.machinesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.usersCollection = db.collection<MongoUser>('users');
          this.machinesCollection = db.collection<MongoMachine>('machines');
          console.log(`MongoDB Collections initialized for seeding`);
        } else {
          console.error("Failed to connect to MongoDB database for seeding");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB collections for seeding:", error);
    }
  }
  
  // Seed users
  async seedUsers(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      // Check if users already exist
      const userCount = await this.usersCollection.countDocuments();
      if (userCount > 0) {
        console.log(`${userCount} users already exist in the database, skipping user seeding`);
        return;
      }
      
      console.log("Seeding users...");
      
      // Generate password hash for sample users
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const userPassword = await bcrypt.hash('password123', salt);
      
      // Create sample users
      const users: MongoUser[] = [
        {
          id: '1',
          name: 'Administrator',
          email: 'admin@learnit.com',
          password: adminPassword,
          isAdmin: true,
          certifications: ['1', '2', '3', '4', '5', '6', '7', '8'], // All machines by default
          bookings: [],
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          name: 'John Doe',
          email: 'john@example.com',
          password: userPassword,
          isAdmin: false,
          certifications: ['1', '2', '3', '5'], // Laser Cutter, Ultimaker, Safety Course, X1 E Carbon
          bookings: [],
          lastLogin: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: userPassword,
          isAdmin: false,
          certifications: ['3', '6', '8'], // Safety Course, Soldering, Safety Cabinet
          bookings: [],
          lastLogin: new Date().toISOString()
        }
      ];
      
      // Insert users into database
      await this.usersCollection.insertMany(users);
      console.log(`Successfully seeded ${users.length} users`);
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  }
  
  // Seed bookings
  async seedBookings(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      // Get all users
      const users = await this.usersCollection.find().toArray();
      
      if (users.length === 0) {
        console.log("No users found to seed bookings");
        return;
      }
      
      // Check if users already have bookings
      let totalBookings = 0;
      for (const user of users) {
        totalBookings += user.bookings.length;
      }
      
      if (totalBookings > 0) {
        console.log(`${totalBookings} bookings already exist, skipping booking seeding`);
        return;
      }
      
      console.log("Seeding bookings...");
      
      // Get current date and format it
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
      
      // Get tomorrow's date
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Get next week's date
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      // Machine names mapped to consistent IDs 
      const machineMap: Record<string, string> = {
        'Laser Cutter': '1',
        'Ultimaker': '2',
        'Safety Course': '3',
        'CNC Mill': '4',
        'X1 E Carbon 3D Printer': '5',
        'Soldering Station': '6',
        'Vinyl Cutter': '7',
        'Safety Cabinet': '8'
      };
      
      // Create sample bookings and assign to users
      for (const user of users) {
        if (user.id === '1') {
          // Admin user doesn't need bookings
          continue;
        }
        
        const bookings = [];
        
        // Create bookings for user "John Doe"
        if (user.id === '2') {
          bookings.push({
            id: `booking-${user.id}-1`,
            machineId: machineMap['Laser Cutter'],
            date: today,
            time: '10:00 - 12:00',
            status: 'Approved'
          });
          
          bookings.push({
            id: `booking-${user.id}-2`,
            machineId: machineMap['Ultimaker'],
            date: tomorrowStr,
            time: '14:00 - 16:00',
            status: 'Pending'
          });
        }
        
        // Create bookings for user "Jane Smith"
        if (user.id === '3') {
          bookings.push({
            id: `booking-${user.id}-1`,
            machineId: machineMap['Soldering Station'],
            date: today,
            time: '13:00 - 15:00',
            status: 'Approved'
          });
          
          bookings.push({
            id: `booking-${user.id}-2`,
            machineId: machineMap['X1 E Carbon 3D Printer'],
            date: nextWeekStr,
            time: '09:00 - 11:00',
            status: 'Pending'
          });
        }
        
        // Add bookings to user
        user.bookings = bookings;
        
        // Update user in database
        await this.usersCollection.updateOne(
          { id: user.id },
          { $set: { bookings } }
        );
        
        console.log(`Added ${bookings.length} bookings to user ${user.name}`);
      }
      
      console.log("Successfully seeded bookings");
    } catch (error) {
      console.error("Error seeding bookings:", error);
    }
  }
  
  // Seed machines if needed
  async seedMachines(): Promise<void> {
    await this.initCollections();
    if (!this.machinesCollection) return;
    
    try {
      // Check if machines already exist
      const machineCount = await this.machinesCollection.countDocuments();
      if (machineCount > 0) {
        console.log(`${machineCount} machines already exist in the database, skipping machine seeding`);
        return;
      }
      
      console.log("Seeding machines...");
      
      // Create sample machines with consistent IDs
      const machines: MongoMachine[] = [
        {
          _id: '1',
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
          _id: '2',
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
          _id: '3',
          name: 'Safety Course',
          type: 'Safety Course',
          description: 'Required safety training for all makerspace users.',
          status: 'Available',
          requiresCertification: false,
          difficulty: 'Beginner',
          imageUrl: '/machines/safety.jpg'
        },
        {
          _id: '4',
          name: 'CNC Mill',
          type: 'CNC Machine',
          description: 'Industrial CNC milling machine for precision metalworking.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Advanced',
          imageUrl: '/machines/cnc-mill.jpg',
          specifications: 'Work area: 40" x 20" x 25", Materials: Aluminum, Steel, Plastics'
        },
        {
          _id: '5',
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
          _id: '6',
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
          _id: '7',
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
          _id: '8',
          name: 'Safety Cabinet',
          type: 'Workshop',
          description: 'Full suite of safety equipment and protective gear.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/woodworking.jpg'
        }
      ];
      
      // Insert machines into database
      await this.machinesCollection.insertMany(machines);
      console.log(`Successfully seeded ${machines.length} machines`);
    } catch (error) {
      console.error("Error seeding machines:", error);
    }
  }
}

// Create a singleton instance
const mongoSeedService = new MongoSeedService();
export default mongoSeedService;
