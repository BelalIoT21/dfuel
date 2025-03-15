
import { User } from './database';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, offlineMode?: boolean) => Promise<any>;
  register: (email: string, password: string, name: string, offlineMode?: boolean) => Promise<any>;
  logout: () => Promise<void>;
  addCertification: (userId: string, machineId: string) => Promise<boolean>;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<boolean>;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegistrationResponse {
  token: string;
  user: User;
}
