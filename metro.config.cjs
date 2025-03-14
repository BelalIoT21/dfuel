
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the project root directory
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Add support for non-standard extensions your project uses
config.resolver.sourceExts = [
  'jsx', 'js', 'ts', 'tsx', 'json', 
  // Add any custom extensions your project uses
  'mjs',
];

// Support for symlinks
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// Fix for ESM compatibility
config.resolver.assetExts = config.resolver.assetExts || [];
config.transformer.minifierPath = 'metro-minify-terser';
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
