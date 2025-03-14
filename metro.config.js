
// Learn more https://docs.expo.io/guides/customizing-metro
import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(import.meta.url);

// Add support for any non-standard extensions your project uses
config.resolver.sourceExts = [
  'jsx', 'js', 'ts', 'tsx', 'json', 
  // Add any custom extensions your project uses
];

// Enable the following 3 lines if you use Reanimated library
// config.resolver.assetExts = [...(config.resolver.assetExts || []), 'lottie'];
// config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
// config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');

export default config;
