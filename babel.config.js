
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add any babel plugins needed for both platforms here
      process.env.NODE_ENV === 'development' && 'react-refresh/babel',
    ].filter(Boolean)
  };
};
