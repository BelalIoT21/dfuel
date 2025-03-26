
import { Collection } from 'mongodb';
import { MongoQuiz } from './types';
import mongoConnectionService from './connectionService';

class MongoQuizService {
  private quizzesCollection: Collection<MongoQuiz> | null = null;
  
  async initCollection(): Promise<void> {
    try {
      if (!this.quizzesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.quizzesCollection = db.collection<MongoQuiz>('quizzes');
          console.log(`MongoDB Quizzes collection initialized: ${this.quizzesCollection ? 'OK' : 'Failed'}`);
          
          if (this.quizzesCollection) {
            const count = await this.quizzesCollection.countDocuments();
            console.log(`Quizzes collection has ${count} documents`);
          }
        } else {
          console.error("Failed to connect to MongoDB database");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB quizzes collection:", error);
    }
  }
  
  async getQuizzes(): Promise<MongoQuiz[]> {
    await this.initCollection();
    if (!this.quizzesCollection) {
      console.error("Quizzes collection not initialized");
      return [];
    }
    
    try {
      const quizzes = await this.quizzesCollection.find().sort({ _id: 1 }).toArray();
      console.log(`Retrieved ${quizzes.length} quizzes from MongoDB`);
      return quizzes;
    } catch (error) {
      console.error("Error getting quizzes from MongoDB:", error);
      return [];
    }
  }
  
  async getQuizById(quizId: string): Promise<MongoQuiz | null> {
    await this.initCollection();
    if (!this.quizzesCollection) {
      console.error("Quizzes collection not initialized");
      return null;
    }
    
    try {
      const quiz = await this.quizzesCollection.findOne({ _id: quizId });
      console.log(`Quiz lookup for ID ${quizId}: ${quiz ? quiz.title : 'not found'}`);
      return quiz;
    } catch (error) {
      console.error("Error getting quiz by ID from MongoDB:", error);
      return null;
    }
  }
  
  async createQuiz(quiz: MongoQuiz): Promise<boolean> {
    await this.initCollection();
    if (!this.quizzesCollection) {
      console.error("Quizzes collection not initialized");
      return false;
    }
    
    try {
      // Generate appropriate ID starting at 5
      if (!quiz._id) {
        // Get all existing quizzes
        const existingQuizzes = await this.quizzesCollection.find({}, { projection: { _id: 1 } }).toArray();
        
        // Extract numeric IDs
        const numericIds = existingQuizzes
          .map(q => q._id)
          .filter(id => /^\d+$/.test(id))
          .map(id => parseInt(id));
        
        // Find the highest numeric ID, defaulting to 4 if none found
        // This ensures new IDs start at 5
        const highestId = numericIds.length > 0 ? Math.max(...numericIds) : 4;
        
        // FIXED: Ensure new ID is at least 5
        quiz._id = String(Math.max(highestId + 1, 5));
        
        console.log(`Generated new quiz ID: ${quiz._id}`);
      }
      
      console.log(`Adding new quiz to MongoDB: ${quiz.title} (ID: ${quiz._id})`);
      const result = await this.quizzesCollection.insertOne({
        ...quiz,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return result.acknowledged;
    } catch (error) {
      console.error("Error adding quiz to MongoDB:", error);
      return false;
    }
  }
  
  async updateQuiz(quizId: string, quiz: Partial<MongoQuiz>): Promise<boolean> {
    await this.initCollection();
    if (!this.quizzesCollection) {
      console.error("Quizzes collection not initialized");
      return false;
    }
    
    try {
      console.log(`Updating quiz ${quizId} in MongoDB`);
      
      // Special handling for imageUrl when it's explicitly set to null or empty string
      const updateData: any = { ...quiz, updatedAt: new Date() };
      
      // If imageUrl is explicitly null, remove it from the database
      if (quiz.imageUrl === null) {
        console.log(`Removing image from quiz ${quizId}`);
        await this.quizzesCollection.updateOne(
          { _id: quizId },
          { $unset: { imageUrl: "" } }
        );
        delete updateData.imageUrl;
      } else if (quiz.imageUrl === "") {
        console.log(`Removing image from quiz ${quizId}`);
        await this.quizzesCollection.updateOne(
          { _id: quizId },
          { $unset: { imageUrl: "" } }
        );
        delete updateData.imageUrl;
      }
      
      const result = await this.quizzesCollection.updateOne(
        { _id: quizId },
        { $set: updateData }
      );
      
      return result.matchedCount > 0;
    } catch (error) {
      console.error("Error updating quiz in MongoDB:", error);
      return false;
    }
  }
  
  async deleteQuiz(quizId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.quizzesCollection) {
      console.error("Quizzes collection not initialized");
      return false;
    }
    
    try {
      console.log(`Deleting quiz ${quizId} from MongoDB`);
      const result = await this.quizzesCollection.deleteOne({ _id: quizId });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting quiz from MongoDB:", error);
      return false;
    }
  }
}

// Create a singleton instance
const mongoQuizService = new MongoQuizService();
export default mongoQuizService;
