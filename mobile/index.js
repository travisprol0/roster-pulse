import { registerRootComponent } from "expo";
import React from "react";
import { StyleSheet } from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import App from "./App";
import { colors } from "./src/ui/theme";

const ZERO_METRICS = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

function Root() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics || ZERO_METRICS}>
      <SafeAreaView style={styles.safe}>
        <App />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
});
