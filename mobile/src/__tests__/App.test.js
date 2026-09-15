import { StyleSheet } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import App from "../../App";
import { fetchLeague } from "../api/league";
import { fetchLeagues } from "../api/leagues";
import { fetchTrades } from "../api/trades";
import { isDesktopWidth } from "../layout";
import { useWindowWidth } from "../useWindowWidth";

jest.mock("../api/espnCredentials", () => ({
  saveEspnCredentials: jest.fn(() => Promise.resolve({ leagues: [{ status: "ok" }] })),
}));

jest.mock("../api/league", () => ({
  fetchLeague: jest.fn(),
  refreshLeague: jest.fn(() => Promise.resolve({ fetchedAt: "" })),
  setLineup: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock("../api/leagues", () => ({
  fetchLeagues: jest.fn(),
  deleteLeague: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock("../api/trades", () => ({
  fetchTrades: jest.fn(),
}));

jest.mock("../api/waivers", () => ({
  fetchWaivers: jest.fn(() => Promise.resolve({ waivers: [] })),
  claimWaiver: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock("../api/evaluate", () => ({
  fetchEvaluate: jest.fn(),
  proposeTrade: jest.fn(() => Promise.resolve({ ok: true })),
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

  const { queryByPlaceholderText, findByText, getByText } = render(<App />);

  expect(getByText("Roster Pulse")).toBeTruthy();
  expect(await findByText("League A")).toBeTruthy();
  expect(await findByText("League B")).toBeTruthy();
  expect(queryByPlaceholderText("League ID 1")).toBeNull();
  await waitFor(() => expect(fetchTrades).toHaveBeenCalledWith("111"));
});

test("cookie fields stay collapsed until Leagues / cookies is expanded", async () => {
  mockLeagues();
  useWindowWidth.mockReturnValue(400);

  const { queryByPlaceholderText, getByPlaceholderText, findByText, getByText } =
    render(<App />);
  await findByText("League A");

  expect(queryByPlaceholderText("League ID 1")).toBeNull();
  fireEvent.press(getByText("Leagues / cookies"));
  expect(getByPlaceholderText("League ID 1")).toBeTruthy();
});

test("shows League ID placeholder when no leagues are loaded", async () => {
  fetchLeagues.mockResolvedValue({ leagues: [] });
  fetchTrades.mockResolvedValue({ trades: [] });
  fetchLeague.mockResolvedValue({ youTeamId: null, teams: [] });
  useWindowWidth.mockReturnValue(400);

  const { findByPlaceholderText } = render(<App />);

  expect(await findByPlaceholderText("League ID 1")).toBeTruthy();
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
  fireEvent.press(getByText("Leagues / cookies"));
  fireEvent.press(getByText("Add league"));
  expect(getByText("League 2")).toBeTruthy();
});
