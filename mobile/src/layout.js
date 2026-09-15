export const DESKTOP_MIN_WIDTH = 900;
export const DATA_TABLE_MIN_WIDTH = 1100;

export function isDesktopWidth(width) {
  return width >= DESKTOP_MIN_WIDTH;
}

export function isDataTableWidth(width) {
  return width >= DATA_TABLE_MIN_WIDTH;
}
