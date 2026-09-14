import { useWindowDimensions } from "react-native";

export function useWindowWidth() {
  return useWindowDimensions().width;
}
