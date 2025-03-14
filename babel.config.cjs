
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      // Add React Native reanimated plugin if needed
      'react-native-reanimated/plugin',
    ],
  };
};
