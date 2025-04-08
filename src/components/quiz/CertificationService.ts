import { apiService } from '../../services/apiService';

export const addUserCertification = async (userId: string, courseId: string, score: number) => {
  try {
    const certification = {
      userId,
      machineId: courseId,
      score,
      dateIssued: new Date().toISOString(),
      status: 'active'
    };

    const response = await apiService.request('certifications', 'POST', certification, true);

    if (response.error) {
      throw new Error(response.error || 'Failed to save certification');
    }

    return response.data;
  } catch (error) {
    console.error('Error saving certification:', error);
    throw error;
  }
};
