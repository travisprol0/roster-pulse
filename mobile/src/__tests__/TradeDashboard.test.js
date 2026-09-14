import { render, waitFor } from "@testing-library/react-native";

import { fetchTrades } from "../api/trades";
import TradeDashboard from "../screens/TradeDashboard";

jest.mock("../api/trades", () => ({
  fetchTrades: jest.fn(),
}));

const mockResponse = {
  trades: [
    {
      id: "t1",
      send: "Bench RB",
      receive: "TE2",
      teamADelta: 4.2,
      teamBDelta: 3.1,
    },
  ],
};

test("shows a loading spinner while fetching trades", () => {
  fetchTrades.mockReturnValue(new Promise(() => {}));

  const { getByTestId } = render(<TradeDashboard leagueId="111" />);

  expect(getByTestId("loading")).toBeTruthy();
});

test("renders proposed trades from the mock JSON response", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText, getByText } = render(<TradeDashboard leagueId="111" />);

  expect(await findByText("Bench RB")).toBeTruthy();
  expect(getByText("You send")).toBeTruthy();
  expect(getByText("You receive")).toBeTruthy();
  expect(getByText("Your delta")).toBeTruthy();
  expect(getByText("Their delta")).toBeTruthy();
  expect(await findByText("TE2")).toBeTruthy();
});

test("displays projected point deltas for both teams", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText } = render(<TradeDashboard leagueId="111" />);

  expect(await findByText("+4.2")).toBeTruthy();
  expect(await findByText("+3.1")).toBeTruthy();
});

test("refetches when leagueId changes", async () => {
  fetchTrades.mockResolvedValue({ trades: [] });

  const { rerender, findByText } = render(<TradeDashboard leagueId="111" />);
  await waitFor(() => expect(fetchTrades).toHaveBeenCalledWith("111"));
  expect(await findByText("No mutually beneficial trades.")).toBeTruthy();

  rerender(<TradeDashboard leagueId="222" />);
  await waitFor(() => expect(fetchTrades).toHaveBeenCalledWith("222"));
});

test("shows empty state when no league is selected", () => {
  const { getByText } = render(<TradeDashboard />);
  expect(getByText("Add a league in settings, then pick it here.")).toBeTruthy();
});
