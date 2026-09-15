import { Platform } from "react-native";

import { resolveApiBase } from "../api/config";

test("web defaults to localhost", () => {
  expect(resolveApiBase({ envBase: "", os: "web" })).toBe("http://localhost:8000");
});

test("env wins", () => {
  expect(resolveApiBase({ envBase: "http://10.0.2.2:8000/", os: "android" })).toBe(
    "http://10.0.2.2:8000"
  );
});

test("native falls back without expo-constants", () => {
  expect(resolveApiBase({ envBase: "", os: "ios" })).toBe("http://localhost:8000");
});

test("platform module loads", () => {
  expect(Platform.OS).toBeTruthy();
});
