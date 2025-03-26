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
      const response = await apiService.request('machines', 'POST', machineData, true);
      console.log("Create machine response:", response);
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
      }
      
      console.log(`Updating machine ${machineId} with data:`, machineData);
      const response = await apiService.request(`machines/${machineId}`, 'PUT', machineData, true);
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
      return response.data || [];
    } catch (error) {
      console.error("API error, could not get all machines:", error);
      return [];
    }
  }

  async getMachineById(machineId: string): Promise<any> {
    try {
      const response = await apiService.request(`machines/${machineId}`, 'GET', undefined, true);
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
