
import { User, UserWithoutSensitiveInfo } from './database';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addCertification: (machineId: string) => Promise<boolean>;
  addSafetyCourse: (courseId?: string) => Promise<boolean>; // Add this method
  updateProfile: (name: string, email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<boolean>;
}

export interface AuthFormProps {
  onSubmit: (values: any) => void;
  loading: boolean;
  errorMessage: string | null;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
