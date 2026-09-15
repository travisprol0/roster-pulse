import { Platform } from "react-native";

function expoLanHost() {
  try {
    const mod = require("expo-constants");
    const Constants = mod.default || mod;
    const uri = Constants.expoConfig?.hostUri || Constants.linkingUri || "";
    const host = String(uri)
      .replace(/^[a-z]+:\/\//i, "")
      .split("/")[0]
      .split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  } catch {
    /* package optional in tests */
  }
  return "localhost";
}

export function resolveApiBase({
  envBase = process.env.EXPO_PUBLIC_API_BASE,
  os = Platform.OS,
} = {}) {
  const trimmed = String(envBase || "").trim().replace(/\/$/, "");
  if (trimmed) {
    return trimmed;
  }
  if (os === "web") {
    return "http://localhost:8000";
  }
  return `http://${expoLanHost()}:8000`;
}

export const API_BASE = resolveApiBase();
