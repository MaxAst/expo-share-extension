# Expo Share Extension

## Intro

I want to build an app, that works similar to Pinterest, where users can save links of clothing items that they've come across while shopping online.

For this, I need to build an expo config plugin, that allows me to create an iOS share extension with a custom UI. The plugin will generate the necessary files and add them to my project. It needs to be able to handle the following:

## XCode Config Plugin

1. Get required info for target (uuid, name, type, bundleId)
2. addXCConfigurationList
3. addProductFile (call addToPbxBuildFileSection with product file)
4. addToPbxNativeTargetSection
5. addBuildPhase & addToPbxCopyfilesBuildPhase
6. addToPbxProjectSection
7. addTargetDependency
8. addPbxGroup
9. addBuildPhases
