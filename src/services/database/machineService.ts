
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
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      console.log(`Getting machine status for ID: ${machineId}`);
      const response = await apiService.request(`machines/${machineId}`, 'GET');
      if (response.data) {
        return response.data.status;
      }
    } catch (error) {
      console.error("API error, using default machine status:", error);
    }
    
    // Default to available if API fails
    return 'Available';
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      console.log(`Updating machine status: ID=${machineId}, status=${status}`);
      const response = await apiService.request(`machines/${machineId}/status`, 'PUT', { status, note }, true);
      return !response.error;
    } catch (error) {
      console.error("API error, could not update machine status:", error);
      return false;
    }
  }

  async createMachine(machineData: MachineData): Promise<any> {
    try {
      console.log("Creating new machine with data:", machineData);
      const response = await apiService.request('machines', 'POST', machineData, true);
      console.log("Machine creation response:", response);
      return response.data;
    } catch (error) {
      console.error("API error, could not create machine:", error);
      throw new Error("Failed to create machine: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  async updateMachine(machineId: string, machineData: Partial<MachineData>): Promise<any> {
    try {
      console.log(`Updating machine ${machineId} with data:`, machineData);
      const response = await apiService.request(`machines/${machineId}`, 'PUT', machineData, true);
      return response.data;
    } catch (error) {
      console.error(`API error, could not update machine ${machineId}:`, error);
      throw new Error("Failed to update machine: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  async deleteMachine(machineId: string): Promise<boolean> {
    try {
      console.log(`Deleting machine: ${machineId}`);
      const response = await apiService.request(`machines/${machineId}`, 'DELETE', undefined, true);
      return !response.error;
    } catch (error) {
      console.error(`API error, could not delete machine ${machineId}:`, error);
      return false;
    }
  }

  async getAllMachines(): Promise<any[]> {
    try {
      console.log("Fetching all machines");
      const response = await apiService.request('machines', 'GET');
      console.log(`Fetched ${response.data?.length || 0} machines`);
      return response.data || [];
    } catch (error) {
      console.error("API error, could not get all machines:", error);
      return [];
    }
  }

  async getMachineById(machineId: string): Promise<any> {
    try {
      console.log(`Fetching machine details for ID: ${machineId}`);
      const response = await apiService.request(`machines/${machineId}`, 'GET');
      return response.data;
    } catch (error) {
      console.error(`API error, could not get machine ${machineId}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const machineDatabaseService = new MachineDatabaseService();
