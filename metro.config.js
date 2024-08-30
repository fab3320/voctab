// Import the default configuration getter
const { getDefaultConfig } = require('expo/metro-config');

// Get the default configuration
const defaultConfig = getDefaultConfig(__dirname);

// Override specific settings
module.exports = {
    ...defaultConfig, // Spread the default configuration
    resolver: {
        ...defaultConfig.resolver, // Spread the default resolver settings
        // Add or override your custom resolver settings
        assetExts: [...defaultConfig.resolver.assetExts, 'xlsx'], // Add custom extensions if needed
    },


};