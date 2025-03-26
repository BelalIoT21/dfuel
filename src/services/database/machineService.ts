
import { apiService } from '../apiService';
import { BaseService } from './baseService';

export interface MachineData {
  name: string;
  type: string;
  description: string;
  status: string;
  requiresCertification?: boolean;
  difficulty?: string;
  imageUrl?: string;
  image?: string; // Added for compatibility with both image properties
  details?: string;
  specifications?: string;
  certificationInstructions?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
}

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  // Define default image mappings for standard machines
  private defaultImageMap: Record<string, string> = {
    '1': '/lovable-uploads/81c40f5d-e4d4-42ef-8262-0467a8fb48c3.png', // Laser Cutter
    '2': '/lovable-uploads/82f38bc9-30e8-4f58-9ad4-93d158cacf88.png', // Ultimaker
    '3': '/lovable-uploads/381a5202-3287-46e3-9eda-f836609b10ac.png', // X1 E Carbon 3D Printer
    '4': '/machines/bambu-lab.jpg' // Bambu Lab
  };

  async getMachineStatus(machineId: string): Promise<string> {
    try {
      const response = await apiService.getMachineStatus(machineId);
      if (response.data) {
        return response.data.status;
      }
    } catch (error) {
      console.error("API error, using default machine status:", error);
    }
    
    // Default to available if API fails
    return 'available';
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      const response = await apiService.updateMachineStatus(machineId, status, note);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, could not update machine status:", error);
      return false;
    }
  }

  async createMachine(machineData: MachineData): Promise<any> {
    try {
      console.log("Creating machine with data:", machineData);
      
      // Ensure both imageUrl and image fields are set to the same value
      if (machineData.imageUrl && !machineData.image) {
        machineData.image = machineData.imageUrl;
      } else if (machineData.image && !machineData.imageUrl) {
        machineData.imageUrl = machineData.image;
      }
      
      // Clean empty strings for linkedCourseId and linkedQuizId
      if (machineData.linkedCourseId === '') {
        machineData.linkedCourseId = undefined;
      }
      
      if (machineData.linkedQuizId === '') {
        machineData.linkedQuizId = undefined;
      }

      // Explicitly convert requiresCertification to boolean
      if (typeof machineData.requiresCertification === 'string') {
        machineData.requiresCertification = machineData.requiresCertification === 'true';
      } else {
        // Make sure it's a boolean
        machineData.requiresCertification = Boolean(machineData.requiresCertification);
      }
      
      console.log("Cleaned machine data for creation:", machineData);
      
      const response = await apiService.request('machines', 'POST', machineData, true);
      console.log("Create machine response:", response);
      
      // Ensure the response has both image properties
      if (response.data) {
        if (response.data.imageUrl && !response.data.image) {
          response.data.image = response.data.imageUrl;
        } else if (response.data.image && !response.data.imageUrl) {
          response.data.imageUrl = response.data.image;
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("API error, could not create machine:", error);
      return null;
    }
  }

  async updateMachine(machineId: string, machineData: Partial<MachineData>): Promise<any> {
    try {
      // Make a deep copy of the machine data to avoid modifying the original
      const cleanedData = JSON.parse(JSON.stringify(machineData));
      
      // For standard machines (1-4), ensure we use the correct image if none is provided
      if (['1', '2', '3', '4'].includes(machineId) && (!cleanedData.imageUrl || cleanedData.imageUrl === '')) {
        console.log(`Using default image for machine ${machineId}`);
        cleanedData.imageUrl = this.defaultImageMap[machineId];
        cleanedData.image = this.defaultImageMap[machineId];
      }
      
      // Ensure both imageUrl and image fields are set to the same value
      if (cleanedData.imageUrl && !cleanedData.image) {
        cleanedData.image = cleanedData.imageUrl;
      } else if (cleanedData.image && !cleanedData.imageUrl) {
        cleanedData.imageUrl = cleanedData.image;
      }
      
      // Fix: Handle courses and quizzes with explicit property checks
      
      // Handle linked course ID with "in" operator to check if property exists
      if ('linkedCourseId' in cleanedData) {
        // Empty string should be converted to null
        if (cleanedData.linkedCourseId === '' || cleanedData.linkedCourseId === 'none') {
          cleanedData.linkedCourseId = null;
        }
        console.log(`Setting linkedCourseId to: ${cleanedData.linkedCourseId}`);
      }
      
      // Handle linked quiz ID with "in" operator to check if property exists
      if ('linkedQuizId' in cleanedData) {
        // Empty string should be converted to null
        if (cleanedData.linkedQuizId === '' || cleanedData.linkedQuizId === 'none') {
          cleanedData.linkedQuizId = null;
        }
        console.log(`Setting linkedQuizId to: ${cleanedData.linkedQuizId}`);
      }
      
      // Handle certification instructions - empty string is valid
      if (cleanedData.certificationInstructions === undefined) {
        // Don't modify if not provided
      } else if (cleanedData.certificationInstructions === null) {
        cleanedData.certificationInstructions = '';
      }

      // Explicitly handle requiresCertification as a boolean
      if ('requiresCertification' in cleanedData) {
        if (typeof cleanedData.requiresCertification === 'string') {
          cleanedData.requiresCertification = cleanedData.requiresCertification === 'true';
        } else {
          // Make sure it's a boolean
          cleanedData.requiresCertification = Boolean(cleanedData.requiresCertification);
        }
        console.log(`Setting requiresCertification to: ${cleanedData.requiresCertification} (${typeof cleanedData.requiresCertification})`);
      }
      
      console.log(`Updating machine ${machineId} with cleaned data:`, cleanedData);
      const response = await apiService.request(`machines/${machineId}`, 'PUT', cleanedData, true);
      console.log(`Update response for machine ${machineId}:`, response);
      
      // Ensure the response has both image properties
      if (response.data) {
        if (response.data.imageUrl && !response.data.image) {
          response.data.image = response.data.imageUrl;
        } else if (response.data.image && !response.data.imageUrl) {
          response.data.imageUrl = response.data.image;
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`API error, could not update machine ${machineId}:`, error);
      return null;
    }
  }

  async deleteMachine(machineId: string): Promise<boolean> {
    try {
      const response = await apiService.request(`machines/${machineId}`, 'DELETE', undefined, true);
      return !response.error;
    } catch (error) {
      console.error(`API error, could not delete machine ${machineId}:`, error);
      return false;
    }
  }

  async getAllMachines(): Promise<any[]> {
    try {
      // Use a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await apiService.request(`machines?t=${timestamp}`, 'GET', undefined, true);
      console.log("Machine response in service:", response);
      
      // Ensure all machines have both imageUrl and image properties
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map(machine => {
          const imageUrl = machine.imageUrl || machine.image || '/placeholder.svg';
          return {
            ...machine,
            imageUrl: imageUrl,
            image: imageUrl
          };
        });
      }
      
      return response.data || [];
    } catch (error) {
      console.error("API error, could not get all machines:", error);
      return [];
    }
  }

  async getMachineById(machineId: string): Promise<any> {
    try {
      const response = await apiService.request(`machines/${machineId}`, 'GET', undefined, true);
      
      // Ensure the machine has both imageUrl and image properties
      if (response.data) {
        const imageUrl = response.data.imageUrl || response.data.image || '/placeholder.svg';
        response.data.imageUrl = imageUrl;
        response.data.image = imageUrl;
      }
      
      return response.data;
    } catch (error) {
      console.error(`API error, could not get machine ${machineId}:`, error);
      return null;
    }
  }
  
  // Add a utility method to link a machine with a course and quiz
  async linkMachineCourseAndQuiz(machineId: string, courseId: string, quizId: string): Promise<boolean> {
    try {
      console.log(`Linking machine ${machineId} with course ${courseId} and quiz ${quizId}`);
      const result = await this.updateMachine(machineId, {
        linkedCourseId: courseId,
        linkedQuizId: quizId
      });
      
      return !!result;
    } catch (error) {
      console.error(`Error linking machine ${machineId} with course and quiz:`, error);
      return false;
    }
  }
}

// Create a singleton instance
export const machineDatabaseService = new MachineDatabaseService();
