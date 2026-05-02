const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve the correct firebase modules
config.resolver.extraNodeModules = {
  '@firebase/app': path.resolve(__dirname, 'node_modules/@firebase/app'),
  '@firebase/auth': path.resolve(__dirname, 'node_modules/@firebase/auth'),
  '@firebase/component': path.resolve(__dirname, 'node_modules/@firebase/component'),
};

module.exports = withNativeWind(config, { input: './global.css' });
