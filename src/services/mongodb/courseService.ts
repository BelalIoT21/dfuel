
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
      // If no _id is provided, generate one based on the count of courses
      if (!course._id) {
        const count = await this.coursesCollection.countDocuments();
        course._id = String(count + 5); // Start from 5 instead of 104
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
      console.log(`Updating course ${courseId} in MongoDB`);
      const result = await this.coursesCollection.updateOne(
        { _id: courseId },
        { 
          $set: { 
            ...course,
            updatedAt: new Date()
          } 
        }
      );
      
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
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting course from MongoDB:", error);
      return false;
    }
  }
}

// Create a singleton instance
const mongoCourseService = new MongoCourseService();
export default mongoCourseService;
