
import { Collection } from 'mongodb';
import { MongoUser, MongoMachine, MongoQuiz, MongoCourse } from './types';
import mongoConnectionService from './connectionService';
import bcrypt from 'bcryptjs';

class MongoSeedService {
  private usersCollection: Collection<MongoUser> | null = null;
  private machinesCollection: Collection<MongoMachine> | null = null;
  private quizzesCollection: Collection<MongoQuiz> | null = null;
  private coursesCollection: Collection<MongoCourse> | null = null;
  
  async initCollections(): Promise<void> {
    try {
      if (!this.usersCollection || !this.machinesCollection || !this.quizzesCollection || !this.coursesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.usersCollection = db.collection<MongoUser>('users');
          this.machinesCollection = db.collection<MongoMachine>('machines');
          this.quizzesCollection = db.collection<MongoQuiz>('quizzes');
          this.coursesCollection = db.collection<MongoCourse>('courses');
          console.log(`MongoDB Collections initialized for seeding`);
        } else {
          console.error("Failed to connect to MongoDB database for seeding");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB collections for seeding:", error);
    }
  }
  
  async seedUsers(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      // Check if admin user exists
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@dfuel.com';
      const adminUser = await this.usersCollection.findOne({ email: adminEmail });
      
      if (adminUser) {
        console.log(`Admin user ${adminEmail} already exists, skipping admin creation`);
        
        // Ensure admin has all certifications
        if (!adminUser.certifications || adminUser.certifications.length < 6) {
          await this.usersCollection.updateOne(
            { email: adminEmail },
            { $set: { certifications: ['1', '2', '3', '4', '5', '6'] } }
          );
          console.log('Updated admin with all certifications');
        }
        
        // Check for regular users
        const userCount = await this.usersCollection.countDocuments({ isAdmin: { $ne: true } });
        if (userCount > 0) {
          console.log(`${userCount} regular users already exist in the database, skipping user seeding`);
          return;
        }
      } else {
        console.log(`Admin user ${adminEmail} not found. Creating admin user...`);
        
        const salt = await bcrypt.genSalt(10);
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        const admin: MongoUser = {
          id: '1', // Use string ID for consistency
          name: 'Administrator',
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true,
          certifications: ['1', '2', '3', '4', '5', '6'],
          bookings: [],
          lastLogin: new Date().toISOString()
        };
        
        await this.usersCollection.insertOne(admin);
        console.log(`Successfully created admin user: ${adminEmail}`);
      }
      
      // Add a regular user for testing if no regular users exist
      const regularUserCount = await this.usersCollection.countDocuments({ isAdmin: { $ne: true } });
      
      if (regularUserCount === 0) {
        console.log("No regular users found. Creating a test user...");
        
        const salt = await bcrypt.genSalt(10);
        const testUser: MongoUser = {
          id: '2',
          name: 'Regular User',
          email: 'user@dfuel.com',
          password: await bcrypt.hash('password123', salt),
          isAdmin: false,
          certifications: [],
          bookings: [],
          lastLogin: new Date().toISOString()
        };
        
        await this.usersCollection.insertOne(testUser);
        console.log(`Successfully created test user: ${testUser.email}`);
      }
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  }
  
  async seedBookings(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      const users = await this.usersCollection.find().toArray();
      
      if (users.length === 0) {
        console.log("No users found to seed bookings");
        return;
      }
      
      let totalBookings = 0;
      for (const user of users) {
        totalBookings += user.bookings.length;
      }
      
      if (totalBookings > 0) {
        console.log(`${totalBookings} bookings already exist, skipping booking seeding`);
        return;
      }
      
      console.log("Seeding bookings...");
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      for (const user of users) {
        if (user.id === '1') {
          continue;
        }
        
        const bookings = [];
        
        user.bookings = bookings;
        
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
  
  async ensureAllMachinesHaveCoursesAndQuizzes(): Promise<void> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return;
    }
    
    try {
      console.log("Ensuring all machines have course and quiz IDs...");
      
      const defaultLinks = {
        '1': { courseId: '5', quizId: '100' },
        '2': { courseId: '2', quizId: '2' },
        '3': { courseId: '3', quizId: '3' },
        '4': { courseId: '4', quizId: '4' },
        '5': { courseId: '5', quizId: '5' },  // Safety Cabinet
        '6': { courseId: '6', quizId: '6' }   // Safety Course
      };
      
      const machines = await this.machinesCollection.find().toArray();
      
      for (const machine of machines) {
        const machineId = machine._id.toString();
        const link = defaultLinks[machineId] || { courseId: machineId, quizId: machineId };
        
        if (!machine.linkedCourseId || !machine.linkedQuizId) {
          const result = await this.machinesCollection.updateOne(
            { _id: machineId },
            { 
              $set: { 
                linkedCourseId: machine.linkedCourseId || link.courseId,
                linkedQuizId: machine.linkedQuizId || link.quizId
              } 
            }
          );
          
          console.log(`Updated machine ${machineId} with course/quiz links:`, result.modifiedCount > 0 ? 'Success' : 'No change needed');
        }
      }
      
      console.log("All machines now have course and quiz IDs");
    } catch (error) {
      console.error("Error updating machine course/quiz links:", error);
    }
  }
  
  async ensureDefaultQuizzesExist(): Promise<void> {
    await this.initCollections();
    if (!this.quizzesCollection) {
      console.error("Quizzes collection not initialized");
      return;
    }
    
    try {
      console.log("Ensuring all default quizzes exist...");
      
      const defaultQuizzes = [
        { _id: '1', title: 'Laser Cutter Certification Quiz' },
        { _id: '2', title: 'Ultimaker Certification Quiz' },
        { _id: '3', title: 'X1 E Carbon 3D Printer Certification' },
        { _id: '4', title: 'Bambu Lab X1 E Certification Quiz' },
        { 
          _id: '5', 
          title: 'Safety Cabinet Certification Quiz',
          description: 'This quiz will test your knowledge of the safety cabinet and its proper use.',
          category: 'Safety',
          questions: [
            {
              question: 'What is the primary purpose of a safety cabinet?',
              options: ['To store heavy equipment', 'To store hazardous materials safely', 'To display tools', 'To lock away valuable items'],
              correctAnswer: 1,
              explanation: 'Safety cabinets are designed to store hazardous materials like flammable liquids, corrosive chemicals, and other dangerous substances in a safe manner.'
            },
            {
              question: 'How should chemicals be arranged in a safety cabinet?',
              options: ['Alphabetically', 'By color', 'By hazard class and compatibility', 'In order of purchase date'],
              correctAnswer: 2,
              explanation: 'Chemicals should be organized by hazard class and compatibility to prevent dangerous reactions if containers leak.'
            },
            {
              question: 'What should you do if you find a leaking container in the safety cabinet?',
              options: ['Ignore it if it\'s a small leak', 'Attempt to fix the container yourself', 'Notify the lab supervisor immediately', 'Leave it for someone else to handle'],
              correctAnswer: 2,
              explanation: 'Always notify the lab supervisor or safety officer immediately if you discover any leaking containers.'
            }
          ],
          passingScore: 70,
          relatedMachineIds: ['5'],
          difficulty: 'Beginner'
        },
        { 
          _id: '6', 
          title: 'Machine Safety Course Certification Quiz',
          description: 'This quiz will test your knowledge of general machine safety procedures and protocols.',
          category: 'Safety',
          questions: [
            {
              question: 'What should you always wear when operating machinery?',
              options: ['Loose-fitting clothes', 'Jewelry', 'Appropriate personal protective equipment (PPE)', 'Headphones'],
              correctAnswer: 2,
              explanation: 'Always wear appropriate PPE such as safety glasses, gloves, or other protective gear as required for the specific machine.'
            },
            {
              question: 'What should you do before operating a machine for the first time?',
              options: ['Just try it out to see how it works', 'Read the operating manual and get proper training', 'Ask another student to show you briefly', 'Watch a quick YouTube tutorial'],
              correctAnswer: 1,
              explanation: 'Always read the operating manual and receive proper training before using any machine for the first time.'
            },
            {
              question: 'What should you do if a machine is making unusual noises or not functioning normally?',
              options: ['Keep using it but be more careful', 'Stop using it immediately and report the issue', 'Try to fix it yourself', 'Increase the speed to see if the noise stops'],
              correctAnswer: 1,
              explanation: 'If a machine is making unusual noises or not functioning normally, stop using it immediately and report the issue to the appropriate personnel.'
            },
            {
              question: 'When should you perform maintenance on a machine?',
              options: ['While it\'s running to see moving parts', 'Only when it breaks down', 'According to the recommended maintenance schedule', 'Whenever you have spare time'],
              correctAnswer: 2,
              explanation: 'Perform maintenance according to the manufacturer\'s recommended schedule to keep equipment in safe working condition.'
            }
          ],
          passingScore: 75,
          relatedMachineIds: ['6'],
          difficulty: 'Beginner'
        }
      ];
      
      const existingQuizzes = await this.quizzesCollection.find({}, { projection: { _id: 1 } }).toArray();
      const existingQuizIds = existingQuizzes.map(q => q._id.toString());
      
      console.log(`Existing quiz IDs: ${existingQuizIds.join(', ')}`);
      
      for (const quiz of defaultQuizzes) {
        if (!existingQuizIds.includes(quiz._id)) {
          console.log(`Creating missing quiz ID ${quiz._id}: ${quiz.title}`);
          await this.quizzesCollection.insertOne(quiz);
        } else {
          console.log(`Quiz ID ${quiz._id} already exists`);
          
          // If it's quiz 5 or 6, update the content to ensure it has questions
          if ((quiz._id === '5' || quiz._id === '6') && 'questions' in quiz) {
            const existingQuiz = await this.quizzesCollection.findOne({ _id: quiz._id });
            if (!existingQuiz?.questions || existingQuiz.questions.length === 0) {
              console.log(`Updating quiz ${quiz._id} with questions`);
              await this.quizzesCollection.updateOne(
                { _id: quiz._id },
                { $set: { 
                    questions: quiz.questions,
                    description: quiz.description,
                    category: quiz.category,
                    passingScore: quiz.passingScore,
                    relatedMachineIds: quiz.relatedMachineIds,
                    difficulty: quiz.difficulty
                  } 
                }
              );
            }
          }
        }
      }
      
      console.log("Quiz check complete");
    } catch (error) {
      console.error("Error checking default quizzes:", error);
    }
  }
  
  async ensureDefaultCoursesExist(): Promise<void> {
    await this.initCollections();
    if (!this.coursesCollection) {
      console.error("Courses collection not initialized");
      return;
    }
    
    try {
      console.log("Ensuring default courses exist...");
      
      const defaultCourses = [
        { 
          _id: '5', 
          title: 'Safety Cabinet Training Course',
          description: 'Learn how to properly use and maintain the safety cabinet for storing hazardous materials.',
          category: 'Safety',
          content: `
# Safety Cabinet Training

## Introduction
Safety cabinets are essential for safely storing hazardous materials in the lab. This course will teach you the proper procedures for using and maintaining a safety cabinet.

## Key Components
- Fire-resistant construction
- Spill containment system
- Self-closing doors
- Ventilation system (if equipped)

## Proper Usage Guidelines
1. Store only compatible materials together
2. Keep containers closed when not in use
3. Never store food or drinks in the cabinet
4. Keep the cabinet locked when not in use
5. Maintain good organization to prevent spills

## Emergency Procedures
If you discover a spill or leak:
1. Notify lab personnel immediately
2. Do not attempt to clean up unknown substances
3. Follow the chemical spill protocol
4. Document the incident

## Maintenance
Regular maintenance ensures the safety cabinet functions properly:
- Inspect seals and hinges monthly
- Clean spills immediately
- Check fire suppression systems (if equipped)
- Verify ventilation is working (if equipped)

Complete the certification quiz to demonstrate your understanding of safety cabinet procedures.
          `,
          relatedMachineIds: ['5'],
          quizId: '5',
          difficulty: 'Beginner'
        },
        { 
          _id: '6', 
          title: 'General Machine Safety Course',
          description: 'Essential safety principles for working with all types of machinery in the workshop.',
          category: 'Safety',
          content: `
# General Machine Safety Course

## Introduction
This course covers the fundamental safety principles that apply to all machine operations in our workshop. Understanding these principles is essential before using any equipment.

## Personal Protective Equipment (PPE)
- Safety glasses or face shields
- Appropriate gloves for the task
- Hearing protection when necessary
- Dust masks or respirators when applicable
- Closed-toe shoes

## General Safety Rules
1. Never operate machinery while impaired or tired
2. Always secure loose clothing, hair, and jewelry
3. Remove watches and rings before operating machinery
4. Use tools only for their intended purpose
5. Keep work areas clean and well-lit
6. Never leave running machines unattended
7. Know the location of emergency stops and exits

## Before Operating Any Machine
1. Receive proper training specific to the machine
2. Read and understand the operating manual
3. Inspect the machine for damage or wear
4. Ensure guards and safety devices are in place
5. Verify emergency stops are functioning

## During Operation
1. Stay focused on the task at hand
2. Maintain proper body position and balance
3. Never reach around, under, or over moving parts
4. Use appropriate feed rates and speeds
5. Stop the machine if unusual noises or vibrations occur

## After Operation
1. Turn off and disconnect power when appropriate
2. Allow moving parts to come to a complete stop
3. Clean the work area and machine
4. Report any issues or concerns to staff

Complete the certification quiz to demonstrate your understanding of general machine safety procedures.
          `,
          relatedMachineIds: ['6'],
          quizId: '6',
          difficulty: 'Beginner'
        }
      ];
      
      const existingCourses = await this.coursesCollection.find({}, { projection: { _id: 1 } }).toArray();
      const existingCourseIds = existingCourses.map(c => c._id.toString());
      
      console.log(`Existing course IDs: ${existingCourseIds.join(', ')}`);
      
      for (const course of defaultCourses) {
        if (!existingCourseIds.includes(course._id)) {
          console.log(`Creating missing course ID ${course._id}: ${course.title}`);
          await this.coursesCollection.insertOne(course);
        } else {
          console.log(`Course ID ${course._id} already exists`);
          
          // Update content for safety courses
          if (course._id === '5' || course._id === '6') {
            const existingCourse = await this.coursesCollection.findOne({ _id: course._id });
            if (!existingCourse?.content || existingCourse.content.length < 100) {
              console.log(`Updating course ${course._id} with content`);
              await this.coursesCollection.updateOne(
                { _id: course._id },
                { $set: { 
                    content: course.content,
                    description: course.description,
                    category: course.category,
                    relatedMachineIds: course.relatedMachineIds,
                    quizId: course.quizId,
                    difficulty: course.difficulty
                  } 
                }
              );
            }
          }
        }
      }
      
      console.log("Course check complete");
    } catch (error) {
      console.error("Error checking default courses:", error);
    }
  }
  
  async seedAll(): Promise<void> {
    await this.initCollections();
    await this.seedUsers();
    await this.seedBookings();
    await this.ensureDefaultQuizzesExist();
    await this.ensureDefaultCoursesExist();
    await this.ensureAllMachinesHaveCoursesAndQuizzes();
    console.log("Database seeding complete");
  }
}

const mongoSeedService = new MongoSeedService();
export default mongoSeedService;
