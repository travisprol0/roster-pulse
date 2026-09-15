import { Platform } from "react-native";

export async function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (Platform.OS !== "web") {
    try {
      const Clipboard = require("expo-clipboard");
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(text);
        return;
      }
    } catch {
      /* optional */
    }
  }
  throw new Error("clipboard unavailable");
}
