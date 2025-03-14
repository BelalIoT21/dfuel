
// Learn more https://docs.expo.io/guides/customizing-metro
import { getDefaultConfig } from 'expo/metro-config';
import { fileURLToPath } from 'url';

// Get the current file path in ES modules
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const config = getDefaultConfig(__dirname);

// Add support for any non-standard extensions your project uses
config.resolver.sourceExts = [
  'jsx', 'js', 'ts', 'tsx', 'json', 
  // Add any custom extensions your project uses
];

// Fix for ESM compatibility
config.resolver.sourceExts.push('mjs');
config.resolver.assetExts = config.resolver.assetExts || [];
config.transformer.minifierPath = 'metro-minify-terser';

export default config;
