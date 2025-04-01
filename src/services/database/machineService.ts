import { apiService } from '../apiService';
import { BaseService } from './baseService';
import mongoDbService from '../mongoDbService';

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
  linkedCourseId?: string | null;
  linkedQuizId?: string | null;
}

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  // Define default image mappings for standard machines
  private defaultImageMap: Record<string, string> = {
    '1': '/utils/images/IMG_7814.jpg', // Laser Cutter
    '2': '/utils/images/IMG_7773.jpg', // Ultimaker
    '3': '/utils/images/IMG_7768.jpg', // X1 E Carbon 3D Printer
    '4': '/utils/images/IMG_7769.jpg', // Bambu Lab
    '5': '/utils/images/IMG_7775.jpg', // Safety Cabinet
    '6': '/utils/images/IMG_7821.jpg'  // Safety Course
  };

  // Get a proper image URL for client display
  private getProperImageUrl(url?: string): string {
    if (!url) return '/placeholder.svg';
    
    // For server paths, keep them as is - they'll be resolved by the components
    if (url.startsWith('/utils/images')) {
      return url;
    }
    
    // For data URLs (base64), return as is
    if (url.startsWith('data:')) {
      return url;
    }
    
    return url || '/placeholder.svg';
  }

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
      
      // Create a deep copy to work with
      const cleanedData = JSON.parse(JSON.stringify(machineData));
      
      // Normalize the status field (convert UI format to API format)
      if (cleanedData.status) {
        let apiStatus = cleanedData.status;
        if (apiStatus === 'Out of Order') {
          apiStatus = 'In Use';
        }
        cleanedData.status = apiStatus;
      }
      
      // IMPORTANT: Ensure both imageUrl and image fields are set for consistency
      // This is critical for ensuring new uploads work during machine creation
      if (cleanedData.imageUrl && !cleanedData.image) {
        cleanedData.image = cleanedData.imageUrl;
        console.log("Added missing image field from imageUrl for new machine");
      } else if (cleanedData.image && !cleanedData.imageUrl) {
        cleanedData.imageUrl = cleanedData.image;
        console.log("Added missing imageUrl field from image for new machine");
      }
      
      // Log image info for debugging
      if (cleanedData.imageUrl) {
        if (cleanedData.imageUrl.startsWith('data:')) {
          console.log(`Image data URL detected for new machine, length: ${cleanedData.imageUrl.length}`);
        } else {
          console.log(`Image URL for new machine: ${cleanedData.imageUrl}`);
        }
      }
      
      // Ensure both imageUrl and image fields are set to the same value
      if (cleanedData.imageUrl && !cleanedData.image) {
        cleanedData.image = cleanedData.imageUrl;
      } else if (cleanedData.image && !cleanedData.imageUrl) {
        cleanedData.imageUrl = cleanedData.image;
      }
      
      // Explicitly handle linkedCourseId and linkedQuizId (empty string -> null)
      if (cleanedData.linkedCourseId === '' || cleanedData.linkedCourseId === 'none') {
        cleanedData.linkedCourseId = null;
      }
      
      if (cleanedData.linkedQuizId === '' || cleanedData.linkedQuizId === 'none') {
        cleanedData.linkedQuizId = null;
      }

      // CRITICAL FIX: Always convert requiresCertification to boolean
      cleanedData.requiresCertification = Boolean(cleanedData.requiresCertification);
      
      console.log("Cleaned machine data for creation:", {
        ...cleanedData,
        imageUrl: cleanedData.imageUrl ? `[Image URL of length ${cleanedData.imageUrl.length}]` : 'none',
        image: cleanedData.image ? `[Image data of length ${cleanedData.image.length}]` : 'none',
        requiresCertification: `${cleanedData.requiresCertification} (${typeof cleanedData.requiresCertification})`,
        status: cleanedData.status
      });
      
      const response = await apiService.request('machines', 'POST', cleanedData, true);
      console.log("Create machine response:", response);
      
      if (!response.data) {
        console.error("Failed to create machine: No data returned from API");
        throw new Error("Failed to create machine: No data returned from API");
      }
      
      // Ensure the response has both image properties and proper URLs
      if (response.data) {
        const imageUrl = this.getProperImageUrl(response.data.imageUrl || response.data.image);
        response.data.image = imageUrl;
        response.data.imageUrl = imageUrl;
      }
      
      return response.data;
    } catch (error) {
      console.error("API error, could not create machine:", error);
      throw new Error(`Failed to create machine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateMachine(machineId: string, machineData: Partial<MachineData>): Promise<any> {
    try {
      // Make a deep copy of the machine data to avoid modifying the original
      const cleanedData = JSON.parse(JSON.stringify(machineData));
      console.log(`Original update data for machine ${machineId}:`, cleanedData);
      
      // Ensure we're updating the correct machine - don't allow ID to be overridden
      if (cleanedData._id && cleanedData._id !== machineId) {
        delete cleanedData._id; // Don't allow changing the machine ID
      }
      
      // Normalize the status field (convert UI format to API format)
      if (cleanedData.status) {
        let apiStatus = cleanedData.status;
        if (apiStatus === 'Out of Order') {
          apiStatus = 'In Use';
        }
        cleanedData.status = apiStatus;
        console.log(`Normalized status for machine ${machineId} to: ${apiStatus}`);
      }
      
      // For standard machines (1-4), ensure we use the correct image if none is provided
      if (['1', '2', '3', '4', '5', '6'].includes(machineId) && (!cleanedData.imageUrl || cleanedData.imageUrl === '')) {
        console.log(`Using default image for machine ${machineId}`);
        cleanedData.imageUrl = this.defaultImageMap[machineId];
        cleanedData.image = this.defaultImageMap[machineId];
      }
      
      // Explicitly handle empty/undefined linkedCourseId and linkedQuizId values
      // Only clear if explicitly set to null, empty, or 'none'
      if ('linkedCourseId' in cleanedData) {
        if (cleanedData.linkedCourseId === '' || cleanedData.linkedCourseId === 'none') {
          cleanedData.linkedCourseId = null; // Set to null explicitly for the API
          console.log(`Setting linkedCourseId to null for machine ${machineId}`);
        }
      }
      
      if ('linkedQuizId' in cleanedData) {
        if (cleanedData.linkedQuizId === '' || cleanedData.linkedQuizId === 'none') {
          cleanedData.linkedQuizId = null; // Set to null explicitly for the API
          console.log(`Setting linkedQuizId to null for machine ${machineId}`);
        }
      }
      
      // CRITICAL FIX: Always explicitly set requiresCertification to a boolean value if provided
      if ('requiresCertification' in cleanedData) {
        cleanedData.requiresCertification = Boolean(cleanedData.requiresCertification);
      }
      
      console.log(`Updating machine ${machineId} with cleaned data:`, cleanedData);
      
      // Create a backup of the current machine state before updating
      try {
        await this.backupMachine(machineId, cleanedData);
      } catch (backupError) {
        console.error(`Error backing up machine ${machineId} before update:`, backupError);
        // Continue with update even if backup fails
      }
      
      const response = await apiService.request(`machines/${machineId}`, 'PUT', cleanedData, true);
      console.log(`Update response for machine ${machineId}:`, response);
      
      // Ensure the response has both image properties with proper URLs
      if (response.data && response.data.machine) {
        const imageUrl = this.getProperImageUrl(response.data.machine.imageUrl || response.data.machine.image);
        response.data.machine.image = imageUrl;
        response.data.machine.imageUrl = imageUrl;
      }
      
      return response.data;
    } catch (error) {
      console.error(`API error, could not update machine ${machineId}:`, error);
      throw new Error(`Failed to update machine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New method to backup a machine before deletion or update
  async backupMachine(machineId: string, updatedData?: any): Promise<boolean> {
    try {
      console.log(`Creating backup for machine ${machineId}`);
      
      // First get the current machine data
      const currentMachine = await this.getMachineById(machineId);
      if (!currentMachine) {
        console.error(`Cannot backup machine ${machineId}: not found`);
        return false;
      }
      
      // If we have update data, merge it with current data to create a "future state" backup
      const backupData = updatedData 
        ? { ...currentMachine, ...updatedData, _backupTime: new Date().toISOString() }
        : { ...currentMachine, _backupTime: new Date().toISOString() };
      
      // Store backup via API
      try {
        await apiService.request(`machines/${machineId}/backup`, 'POST', { 
          backupData: JSON.stringify(backupData)
        }, true);
        console.log(`Successfully backed up machine ${machineId} via API`);
        return true;
      } catch (apiError) {
        console.error(`API backup failed for machine ${machineId}:`, apiError);
        
        // Try MongoDB direct backup if API fails
        try {
          const backupResult = await apiService.request('mongodb/backup-machine', 'POST', {
            machineId,
            backupData: JSON.stringify(backupData)
          }, true);
          
          if (backupResult.data?.success) {
            console.log(`Successfully backed up machine ${machineId} via MongoDB`);
            return true;
          }
        } catch (mongoError) {
          console.error(`MongoDB backup failed for machine ${machineId}:`, mongoError);
        }
      }
      
      console.warn(`Could not create backup for machine ${machineId}`);
      return false;
    } catch (error) {
      console.error(`Error in backupMachine(${machineId}):`, error);
      return false;
    }
  }

  async deleteMachine(machineId: string, permanent: boolean = false): Promise<boolean> {
    try {
      console.log(`Attempting to delete machine ${machineId} (permanent: ${permanent})`);
      
      // First backup the machine before deletion
      await this.backupMachine(machineId);
      
      // Prepare URL with permanent flag if needed
      const deleteUrl = permanent 
        ? `machines/${machineId}?permanent=true`
        : `machines/${machineId}`;
      
      // Try the API with appropriate parameters
      try {
        const response = await apiService.request(deleteUrl, 'DELETE', undefined, true);
        
        if (response.data) {
          if (response.data.permanentlyDeleted) {
            console.log(`Machine ${machineId} was permanently deleted`);
          } else if (response.data.softDeleted) {
            console.log(`Machine ${machineId} was soft-deleted`);
          } else {
            console.log(`Successfully deleted machine ${machineId}`);
          }
          return true;
        }
      } catch (apiError) {
        console.error(`API error deleting machine ${machineId}:`, apiError);
      }
      
      return false;
    } catch (error) {
      console.error("API error in deleteMachine:", error);
      return false;
    }
  }

  async restoreMachine(machineId: string): Promise<boolean> {
    try {
      console.log(`Attempting to restore machine ${machineId}`);
      
      // Try to restore from backup first for any machine
      try {
        const response = await apiService.post(`machines/${machineId}/restore`, { useLatestBackup: true });
        if (response.data && !response.error) {
          console.log(`Successfully restored machine ${machineId} from latest backup`);
          return true;
        }
      } catch (restoreError) {
        console.error(`Error restoring machine ${machineId} from backup:`, restoreError);
      }
      
      // For core machines (IDs 1-6), try to restore from template if backup restore failed
      if (machineId >= '1' && machineId <= '6') {
        try {
          const response = await apiService.post(`machines/${machineId}/restore`, { useTemplate: true });
          if (response.data && !response.error) {
            console.log(`Successfully restored core machine ${machineId} from template`);
            return true;
          }
        } catch (templateError) {
          console.error(`Error restoring core machine ${machineId} from template:`, templateError);
        }
      }
      
      // Try MongoDB direct restoration first
      try {
        // For core machines (IDs 1-6), try to restore from template
        if (machineId >= '1' && machineId <= '6') {
          const response = await apiService.post(`machines/${machineId}/restore`);
          if (response.data && !response.error) {
            console.log(`Successfully restored core machine ${machineId} via API`);
            return true;
          }
        }
        
        // For user-created machines, try to restore from backup
        const success = await mongoDbService.restoreFromBackup(machineId);
        if (success) {
          console.log(`Successfully restored machine ${machineId} from backup via MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error(`MongoDB error restoring machine ${machineId}:`, mongoError);
      }
      
      // Fall back to API
      const response = await apiService.post(`machines/${machineId}/restore`);
      if (response.data && !response.error) {
        console.log(`Successfully restored machine ${machineId} via API`);
        return true;
      }
      
      console.error(`Failed to restore machine ${machineId}`);
      return false;
    } catch (error) {
      console.error(`Error in restoreMachine:`, error);
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
          // Use our helper to get a proper image URL
          const imageUrl = this.getProperImageUrl(machine.imageUrl || machine.image);

          // Ensure requiresCertification is a boolean
          let requiresCertification: boolean;
          if (typeof machine.requiresCertification === 'boolean') {
            requiresCertification = machine.requiresCertification;
          } else if (typeof machine.requiresCertification === 'string') {
            requiresCertification = machine.requiresCertification === 'true';
          } else {
            requiresCertification = Boolean(machine.requiresCertification);
          }

          return {
            ...machine,
            imageUrl: imageUrl,
            image: imageUrl,
            requiresCertification: requiresCertification
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
        // Use our helper to get a proper image URL
        const imageUrl = this.getProperImageUrl(response.data.imageUrl || response.data.image);
        
        // Ensure requiresCertification is a boolean
        let requiresCertification: boolean;
        if (typeof response.data.requiresCertification === 'boolean') {
          requiresCertification = response.data.requiresCertification;
        } else if (typeof response.data.requiresCertification === 'string') {
          requiresCertification = response.data.requiresCertification === 'true';
        } else {
          requiresCertification = Boolean(response.data.requiresCertification);
        }
        
        return {
          ...response.data,
          imageUrl: imageUrl,
          image: imageUrl,
          requiresCertification: requiresCertification
        };
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
