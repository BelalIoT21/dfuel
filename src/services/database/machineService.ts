
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

      // Cast requiresCertification to boolean if it's a string
      if (typeof machineData.requiresCertification === 'string') {
        machineData.requiresCertification = machineData.requiresCertification === 'true';
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
      // For standard machines (1-4), ensure we use the correct image if none is provided
      if (['1', '2', '3', '4'].includes(machineId) && (!machineData.imageUrl || machineData.imageUrl === '')) {
        console.log(`Using default image for machine ${machineId}`);
        machineData.imageUrl = this.defaultImageMap[machineId];
        machineData.image = this.defaultImageMap[machineId];
      }
      
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

      // Cast requiresCertification to boolean if it's a string
      if (typeof machineData.requiresCertification === 'string') {
        machineData.requiresCertification = machineData.requiresCertification === 'true';
      }
      
      console.log(`Updating machine ${machineId} with cleaned data:`, machineData);
      const response = await apiService.request(`machines/${machineId}`, 'PUT', machineData, true);
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
