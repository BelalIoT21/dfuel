
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.learnitacademy',
  appName: 'Learnit',
  webDir: 'dist',
  server: {
    url: 'http://localhost:4000',
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
    backgroundColor: '#ffffff'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerColor: "#7c3aed",
      iosSpinnerStyle: "small",
      androidSpinnerStyle: "large"
    }
  }
};

export default config;
