
import { BaseApiService } from './baseApiService';

export class MachineApiService extends BaseApiService {
  async getMachineStatus(machineId: string) {
    return this.request<{ status: string, note?: string }>(`machines/${machineId}/status`, 'GET');
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return this.request<{ success: boolean }>(
      `machines/${machineId}/status`, 
      'PUT', 
      { status, note }
    );
  }
}

export const machineApiService = new MachineApiService();
