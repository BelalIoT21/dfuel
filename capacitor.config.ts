
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.learnitacademy',
  appName: 'learnit-academy',
  webDir: 'dist',
  server: {
    url: 'https://65989570-cd1d-40f5-b27e-214d8336aca9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false,
  android: {
    buildOptions: {
      releaseType: 'development'
    }
  },
  ios: {
    contentInset: 'always',
    scheme: 'com.lovable.learnitacademy',
    backgroundColor: '#7c3aed'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7c3aed",
      showSpinner: true,
      spinnerColor: "#ffffff",
      iosSpinnerStyle: "small",
      androidSpinnerStyle: "large"
    }
  }
};

export default config;
