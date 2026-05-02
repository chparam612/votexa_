const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve the correct firebase modules
config.resolver.extraNodeModules = {
  '@firebase/app': path.resolve(__dirname, 'node_modules/@firebase/app'),
  '@firebase/auth': path.resolve(__dirname, 'node_modules/@firebase/auth'),
  '@firebase/component': path.resolve(__dirname, 'node_modules/@firebase/component'),
};

// These are Node.js-only packages used in server-side code paths (guarded by isNode checks).
// Metro should not attempt to bundle them for the React Native app.
const NODE_ONLY_MODULES = [
  'redis',
  '@google-cloud/bigquery',
  '@google-cloud/logging',
  '@google-cloud/monitoring',
  '@google-cloud/pubsub',
  '@google-cloud/secret-manager',
  '@google-cloud/vertexai',
  '@google-cloud/tasks',
  'firebase-admin',
  'fs',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (NODE_ONLY_MODULES.some((mod) => moduleName === mod || moduleName.startsWith(`${mod}/`))) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
