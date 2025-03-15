
/**
 * Navigation debugging utility functions
 */

// Function to check if screens are registered in the navigation container
export const validateNavigation = (navigation: any, screens: string[]): boolean => {
  try {
    // Get the navigation state
    const state = navigation.getState();
    console.log('Current navigation state:', state);
    
    if (!state || !state.routeNames) {
      console.error('Navigation state is invalid or not initialized properly');
      return false;
    }
    
    // Check if all required screens exist in the navigation
    const missingScreens = screens.filter(screen => !state.routeNames.includes(screen));
    
    if (missingScreens.length > 0) {
      console.error('Missing screens in navigation:', missingScreens);
      return false;
    }
    
    console.log('All screens are properly registered:', screens);
    return true;
  } catch (error) {
    console.error('Error validating navigation:', error);
    return false;
  }
};

// Function to log navigation events for debugging
export const setupNavigationLogging = (navigation: any): void => {
  const listeners = [
    navigation.addListener('state', (e: any) => {
      console.log('Navigation state changed:', e.data);
    }),
    navigation.addListener('error', (e: any) => {
      console.error('Navigation error:', e);
    })
  ];
  
  // Return cleanup function
  return () => {
    listeners.forEach(listener => listener());
  };
};
