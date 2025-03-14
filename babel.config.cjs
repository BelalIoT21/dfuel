
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Make sure expo-router is the first entry
      'expo-router/babel',
      // Add React Native reanimated plugin if needed
      'react-native-reanimated/plugin',
      // Add support for path aliases
      ['module-resolver', {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      }],
    ],
  };
};
