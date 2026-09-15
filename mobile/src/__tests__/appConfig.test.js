import appConfig from "../../app.json";

import { colors } from "../ui/theme";

test("uses the dashboard theme for native and web launch surfaces", () => {
  expect(appConfig.expo.userInterfaceStyle).toBe("dark");
  expect(appConfig.expo.backgroundColor).toBe(colors.canvas);
  expect(appConfig.expo.android.backgroundColor).toBe(colors.canvas);
  expect(appConfig.expo.android.adaptiveIcon.backgroundColor).toBe(colors.canvas);
  expect(appConfig.expo.web.backgroundColor).toBe(colors.canvas);
});
