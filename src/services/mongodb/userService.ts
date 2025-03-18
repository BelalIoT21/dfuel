import { Collection } from 'mongodb';
import { MongoUser } from './types';
import mongoConnectionService from './connectionService';

class MongoUserService {
  private usersCollection: Collection<MongoUser> | null = null;

  async initCollection(): Promise<void> {
    if (!this.usersCollection) {
      const db = await mongoConnectionService.connect();
      if (db) {
        this.usersCollection = db.collection<MongoUser>('users');
        if (this.usersCollection) {
          await this.usersCollection.createIndex({ email: 1 }, { unique: true });
        }
      }
    }
  }

  async getUsers(): Promise<MongoUser[]> {
    await this.initCollection();
    if (!this.usersCollection) return [];

    try {
      return await this.usersCollection.find().toArray();
    } catch (error) {
      console.error("Error getting users from MongoDB:", error);
      return [];
    }
  }

  async getUserByEmail(email: string): Promise<MongoUser | null> {
    await this.initCollection();
    if (!this.usersCollection) return null;
    if (!email) return null;

    try {
      return await this.usersCollection.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error("Error getting user by email from MongoDB:", error);
      return null;
    }
  }

  async getUserById(id: string): Promise<MongoUser | null> {
    await this.initCollection();
    if (!this.usersCollection) return null;
    if (!id) return null;

    try {
      return await this.usersCollection.findOne({ id });
    } catch (error) {
      console.error("Error getting user by ID from MongoDB:", error);
      return null;
    }
  }

  async createUser(user: MongoUser): Promise<MongoUser | null> {
    await this.initCollection();
    if (!this.usersCollection) return null;

    try {
      if (!user || !user.email) {
        console.error("Invalid user data for createUser");
        return null;
      }
      
      const existingUser = await this.getUserByEmail(user.email);
      if (existingUser) return null;

      // Ensure lastLogin is a valid date
      if (user.lastLogin) {
        try {
          user.lastLogin = new Date(user.lastLogin).toISOString();
        } catch (e) {
          console.error("Invalid date format for lastLogin, using current date");
          user.lastLogin = new Date().toISOString();
        }
      } else {
        user.lastLogin = new Date().toISOString();
      }

      await this.usersCollection.insertOne(user);
      return user;
    } catch (error) {
      console.error("Error creating user in MongoDB:", error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<MongoUser>): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    if (!id) return false;

    try {
      console.log(`MongoUserService: Updating user ${id} with:`, updates);
      
      // First get the user to make sure they exist
      const user = await this.getUserById(id);
      if (!user) {
        console.error(`User ${id} not found for update`);
        return false;
      }
      
      // Ensure lastLogin is a valid date if provided
      if (updates.lastLogin) {
        try {
          updates.lastLogin = new Date(updates.lastLogin).toISOString();
        } catch (e) {
          console.error("Invalid date format for lastLogin in updates, using current date");
          updates.lastLogin = new Date().toISOString();
        }
      }

      const result = await this.usersCollection.updateOne(
        { id },
        { $set: updates }
      );
      
      console.log(`MongoDB update result: modified=${result.modifiedCount}, matched=${result.matchedCount}`);
      
      // Consider it successful if a document was matched, even if not modified
      // (could happen if updating with the same values)
      return result.matchedCount > 0;
    } catch (error) {
      console.error(`Error updating user ${id} in MongoDB:`, error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    if (!id) return false;

    try {
      const user = await this.getUserById(id);
      if (!user) {
        console.log(`User ${id} not found`);
        return false;
      }

      const result = await this.usersCollection.deleteOne({ id });
      console.log(`User deletion result: deleted count=${result.deletedCount}`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async updateUserCertifications(userId: string, certificationId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    if (!userId || !certificationId) return false;

    try {
      const user = await this.getUserById(userId);
      if (!user) {
        console.log(`User ${userId} not found`);
        return false;
      }

      const result = await this.usersCollection.updateOne(
        { id: userId },
        { $addToSet: { certifications: certificationId } }
      );
      
      console.log(`updateUserCertifications result: ${result.modifiedCount > 0 ? 'success' : 'no change needed'}`);
      return true; // Return true even if certification already exists
    } catch (error) {
      console.error("Error updating user certifications:", error);
      return false;
    }
  }

  async removeUserCertification(userId: string, certificationId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    if (!userId || !certificationId) return false;

    try {
      const result = await this.usersCollection.updateOne(
        { id: userId },
        { $pull: { certifications: certificationId } }
      );
      
      console.log(`removeUserCertification result: ${result.modifiedCount > 0 ? 'success' : 'no change needed'}`);
      return true; // Return true even if certification wasn't there
    } catch (error) {
      console.error("Error removing user certification:", error);
      return false;
    }
  }

  async clearUserCertifications(userId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    if (!userId) return false;

    try {
      const result = await this.usersCollection.updateOne(
        { id: userId },
        { $set: { certifications: [] } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error clearing user certifications:", error);
      return false;
    }
  }
}

const mongoUserService = new MongoUserService();
export default mongoUserService;
