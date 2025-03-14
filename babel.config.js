
export default function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add any babel plugins needed for both platforms here
      process.env.NODE_ENV === 'development' && 'react-refresh/babel',
      // Module resolver to handle platform-specific imports
      ['module-resolver', {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.native.js',
          '.native.tsx',
          '.native.ts',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
        ],
        alias: {
          // This helps resolve platform-specific files
          '@': './src',
        },
      }],
    ].filter(Boolean)
  };
};
