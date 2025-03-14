
import { apiClient, ApiResponse } from './apiClient';

class MachineApi {
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.request<{ success: boolean }>(
      `machines/${machineId}/status`, 
      'PUT', 
      { status, note }
    );
  }
  
  async getMachineStatus(machineId: string): Promise<ApiResponse<{ status: string, note?: string }>> {
    return apiClient.request<{ status: string, note?: string }>(`machines/${machineId}/status`, 'GET');
  }
}

export const machineApi = new MachineApi();
