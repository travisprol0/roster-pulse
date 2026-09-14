import { StyleSheet } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import App from "../../App";
import { fetchLeague } from "../api/league";
import { fetchLeagues } from "../api/leagues";
import { fetchTrades } from "../api/trades";
import { isDesktopWidth } from "../layout";
import { useWindowWidth } from "../useWindowWidth";

jest.mock("../api/espnCredentials", () => ({
  saveEspnCredentials: jest.fn(() => Promise.resolve()),
}));

jest.mock("../api/league", () => ({
  fetchLeague: jest.fn(),
}));

jest.mock("../api/leagues", () => ({
  fetchLeagues: jest.fn(),
}));

jest.mock("../api/trades", () => ({
  fetchTrades: jest.fn(),
}));

jest.mock("../useWindowWidth", () => ({
  useWindowWidth: jest.fn(() => 400),
}));

function mockLeagues() {
  fetchLeagues.mockResolvedValue({
    leagues: [
      { id: "111", name: "League A" },
      { id: "222", name: "League B" },
    ],
  });
  fetchTrades.mockResolvedValue({ trades: [] });
  fetchLeague.mockResolvedValue({ youTeamId: null, teams: [] });
}

test("isDesktopWidth is true at 900 and above", () => {
  expect(isDesktopWidth(899)).toBe(false);
  expect(isDesktopWidth(900)).toBe(true);
});

test("shows settings, loads switcher leagues, and fetches trades by league id", async () => {
  mockLeagues();
  useWindowWidth.mockReturnValue(400);

  const { getByPlaceholderText, findByText, getByText } = render(<App />);

  expect(getByPlaceholderText("League ID 1")).toBeTruthy();
  expect(getByText("Roster Pulse")).toBeTruthy();
  expect(await findByText("League A")).toBeTruthy();
  expect(await findByText("League B")).toBeTruthy();
  await waitFor(() => expect(fetchTrades).toHaveBeenCalledWith("111"));
});

test("uses a two-column layout at desktop width", async () => {
  mockLeagues();
  useWindowWidth.mockReturnValue(1200);

  const { getByTestId, findByText } = render(<App />);
  await findByText("League A");

  const style = StyleSheet.flatten(getByTestId("app-layout").props.style);
  expect(style.flexDirection).toBe("row");
});

test("uses a stacked layout on a narrow screen", async () => {
  mockLeagues();
  useWindowWidth.mockReturnValue(400);

  const { getByTestId, findByText } = render(<App />);
  await findByText("League A");

  const style = StyleSheet.flatten(getByTestId("app-layout").props.style);
  expect(style.flexDirection).toBe("column");
});

test("page scrolls and settings buttons still press", async () => {
  mockLeagues();
  useWindowWidth.mockReturnValue(400);

  const { getByTestId, getByText, findByText } = render(<App />);
  await findByText("League A");

  expect(getByTestId("app-scroll").type).toBe("RCTScrollView");
  fireEvent.press(getByText("Add league"));
  expect(getByText("League 2")).toBeTruthy();
});
