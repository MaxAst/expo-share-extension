const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const path = require("path");

const { withShareExtension } = require("../metro");

config.watchFolders = [path.resolve(__dirname, "..")];

module.exports = withShareExtension(config);

module.exports = config;
