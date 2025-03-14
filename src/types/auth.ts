
// Auth types
import { User } from './database';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin?: (googleData: any) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  addCertification: (machineId: string) => Promise<boolean>;
  updateProfile: (details: { name?: string; email?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<boolean>;
}

export interface GoogleLoginData {
  email: string;
  name: string;
  sub: string; // Google's user ID
  picture?: string;
}
