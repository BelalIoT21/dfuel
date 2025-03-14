
import { BaseApiService } from './baseApiService';

export class AuthApiService extends BaseApiService {
  async login(email: string, password: string) {
    console.log('Attempting login via API for:', email);
    return this.request<{ token: string, user: any }>(
      'auth/login', 
      'POST', 
      { email, password },
      false
    );
  }
  
  async register(userData: any) {
    console.log('Attempting registration via API for:', userData.email);
    return this.request<{ token: string, user: any }>(
      'auth/register', 
      'POST', 
      userData,
      false
    );
  }
  
  async getCurrentUser() {
    return this.request<any>('users/me', 'GET');
  }
  
  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.request<void>(
      `users/${userId}/password`, 
      'PUT', 
      { currentPassword, newPassword }
    );
  }
}

export const authApiService = new AuthApiService();
