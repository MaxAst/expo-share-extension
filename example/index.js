import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";

import App from "./App";
import ShareExtension from "./ShareExtension";

registerRootComponent(App);

AppRegistry.registerComponent("extension", () => ShareExtension);
