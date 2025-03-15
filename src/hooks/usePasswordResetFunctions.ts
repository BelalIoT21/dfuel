
// This hook has been deprecated as password reset functionality has been removed
export const usePasswordResetFunctions = () => {
  return {
    requestPasswordReset: async () => false,
    resetPassword: async () => false
  };
};
