
import { Collection } from 'mongodb';
import { MongoCourse } from './types';
import mongoConnectionService from './connectionService';

class MongoCourseService {
  private coursesCollection: Collection<MongoCourse> | null = null;
  
  async initCollection(): Promise<void> {
    try {
      if (!this.coursesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.coursesCollection = db.collection<MongoCourse>('courses');
          console.log(`MongoDB Courses collection initialized: ${this.coursesCollection ? 'OK' : 'Failed'}`);
          
          if (this.coursesCollection) {
            const count = await this.coursesCollection.countDocuments();
            console.log(`Courses collection has ${count} documents`);
          }
        } else {
          console.error("Failed to connect to MongoDB database");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB courses collection:", error);
    }
  }
  
  async getCourses(): Promise<MongoCourse[]> {
    await this.initCollection();
    if (!this.coursesCollection) {
      console.error("Courses collection not initialized");
      return [];
    }
    
    try {
      const courses = await this.coursesCollection.find().sort({ _id: 1 }).toArray();
      console.log(`Retrieved ${courses.length} courses from MongoDB`);
      return courses;
    } catch (error) {
      console.error("Error getting courses from MongoDB:", error);
      return [];
    }
  }
  
  async getCourseById(courseId: string): Promise<MongoCourse | null> {
    await this.initCollection();
    if (!this.coursesCollection) {
      console.error("Courses collection not initialized");
      return null;
    }
    
    try {
      const course = await this.coursesCollection.findOne({ _id: courseId });
      console.log(`Course lookup for ID ${courseId}: ${course ? course.title : 'not found'}`);
      return course;
    } catch (error) {
      console.error("Error getting course by ID from MongoDB:", error);
      return null;
    }
  }
  
  async createCourse(course: MongoCourse): Promise<boolean> {
    await this.initCollection();
    if (!this.coursesCollection) {
      console.error("Courses collection not initialized");
      return false;
    }
    
    try {
      // Generate a new ID for the course starting at 5
      if (!course._id) {
        // Get all existing courses
        const existingCourses = await this.coursesCollection.find({}, { projection: { _id: 1 } }).toArray();
        
        // Convert IDs to numbers for comparison (filter out non-numeric IDs)
        const numericIds = existingCourses
          .map(c => c._id)
          .filter(id => /^\d+$/.test(id))
          .map(id => parseInt(id));
        
        // Find the highest numeric ID
        const highestId = numericIds.length > 0 ? Math.max(...numericIds) : 4;
        
        // FIXED: Ensure new ID is at least 5
        course._id = String(Math.max(highestId + 1, 5));
        console.log(`Generated new course ID: ${course._id}`);
      }
      
      console.log(`Adding new course to MongoDB: ${course.title} (ID: ${course._id})`);
      const result = await this.coursesCollection.insertOne({
        ...course,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return result.acknowledged;
    } catch (error) {
      console.error("Error adding course to MongoDB:", error);
      return false;
    }
  }
  
  async updateCourse(courseId: string, course: Partial<MongoCourse>): Promise<boolean> {
    await this.initCollection();
    if (!this.coursesCollection) {
      console.error("Courses collection not initialized");
      return false;
    }
    
    try {
      console.log(`Updating course ${courseId} in MongoDB with data:`, course);
      const result = await this.coursesCollection.updateOne(
        { _id: courseId },
        { 
          $set: { 
            ...course,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log(`Update result: matchedCount=${result.matchedCount}, modifiedCount=${result.modifiedCount}`);
      return result.matchedCount > 0;
    } catch (error) {
      console.error("Error updating course in MongoDB:", error);
      return false;
    }
  }
  
  async deleteCourse(courseId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.coursesCollection) {
      console.error("Courses collection not initialized");
      return false;
    }
    
    try {
      console.log(`Deleting course ${courseId} from MongoDB`);
      const result = await this.coursesCollection.deleteOne({ _id: courseId });
      
      console.log(`Delete result: deletedCount=${result.deletedCount}`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting course from MongoDB:", error);
      return false;
    }
  }
  
  // Method to verify and fix course data integrity
  async checkAndRepairCourses(): Promise<void> {
    await this.initCollection();
    if (!this.coursesCollection) {
      console.error("Courses collection not initialized");
      return;
    }
    
    try {
      // Define expected course IDs
      const expectedCourseIds = ['1', '2', '3', '4'];
      
      // Get existing course IDs
      const existingCourses = await this.coursesCollection.find({}, { projection: { _id: 1 } }).toArray();
      const existingCourseIds = existingCourses.map(c => c._id);
      
      console.log(`Checking course integrity. Found ${existingCourses.length} courses with IDs: ${existingCourseIds.join(', ')}`);
      
      // Find missing course IDs
      const missingCourseIds = expectedCourseIds.filter(id => !existingCourseIds.includes(id));
      
      if (missingCourseIds.length > 0) {
        console.log(`Missing expected course IDs in MongoDB: ${missingCourseIds.join(', ')}`);
        console.log('These may need to be re-created from the seed process');
      }
    } catch (error) {
      console.error('Error checking course data integrity:', error);
    }
  }
}

// Create a singleton instance
const mongoCourseService = new MongoCourseService();
export default mongoCourseService;
