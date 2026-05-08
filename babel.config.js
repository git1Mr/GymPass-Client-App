// babel.config.js
// CHANGED: react-native-reanimated v4 moved worklets to a separate package.
// The plugin is now 'react-native-worklets/plugin' — NOT 'react-native-reanimated/plugin'.
// It must still be listed LAST.

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // ... any other plugins (e.g. module-resolver) go here BEFORE worklets
      "react-native-worklets/plugin", // ← MUST be last
    ],
  };
};
