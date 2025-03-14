
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Make sure expo-router is the first entry
      require.resolve('expo-router/babel'),
      // Add React Native reanimated plugin if needed
      'react-native-reanimated/plugin',
    ],
  };
};
