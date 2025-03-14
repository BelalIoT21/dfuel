
module.exports = {
  name: "Learnit",
  slug: "learnit",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#7c3aed"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.learnit.academy"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#7c3aed"
    },
    package: "com.learnit.academy"
  },
  web: {
    favicon: "./assets/favicon.ico"
  },
  plugins: [
    "expo-router"
  ],
  scheme: "learnit",
  extra: {
    eas: {
      projectId: "your-project-id-here"
    }
  }
};
