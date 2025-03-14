
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add any babel plugins needed for both platforms here
      process.env.NODE_ENV === 'development' && 'react-refresh/babel',
      // Disable native module resolution for web builds
      ['module-resolver', {
        alias: {
          // This helps resolve platform-specific files
          'react-native': process.env.PLATFORM === 'web' ? 'react-native-web' : 'react-native',
        },
      }],
    ].filter(Boolean)
  };
};
