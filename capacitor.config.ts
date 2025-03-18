
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.learnitacademy',
  appName: 'Learnit',
  webDir: 'dist',
  server: {
    url: 'http://192.168.47.238:4000',
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
