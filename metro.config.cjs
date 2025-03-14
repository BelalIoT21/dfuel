
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
  'mjs', 'cjs',
];

// Support for symlinks
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// Ensure resolver config is properly set
config.resolver.assetExts = config.resolver.assetExts || [];
config.transformer.minifierPath = 'metro-minify-terser';
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Explicitly include web extensions (for handling web-specific assets)
if (config.resolver.assetExts) {
  config.resolver.assetExts.push('svg', 'webp', 'ttf', 'otf');
}

module.exports = config;
