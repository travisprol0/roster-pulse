import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { copyText } from "../clipboard";
import { fetchTrades } from "../api/trades";
import TradeDashboard from "../screens/TradeDashboard";

jest.mock("../api/trades", () => ({
  fetchTrades: jest.fn(),
}));

jest.mock(
  "../clipboard",
  () => ({
    copyText: jest.fn(() => Promise.resolve()),
  }),
  { virtual: true }
);

const mockResponse = {
  trades: [
    {
      id: "t1",
      send: "Bench RB",
      receive: "TE2",
      sendId: "a-rb3",
      receiveId: "b-te2",
      teamBId: 2,
      teamBName: "Other Team",
      teamADelta: 4.2,
      teamBDelta: 3.1,
      beforeA: 610,
      afterA: 614.2,
      beforeB: 480,
      afterB: 483.1,
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

test("shows counterpart team on each suggested trade row", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText, getByText, queryByText } = render(
    <TradeDashboard leagueId="111" />
  );

  expect(await findByText("Other Team")).toBeTruthy();
  expect(getByText("Them")).toBeTruthy();
  expect(queryByText("Workshop")).toBeNull();
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

test("pressing a suggested trade opens the Workshop with counterpart and totals", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText, getByText, queryByText } = render(
    <TradeDashboard leagueId="111" />
  );

  fireEvent.press(await findByText("Bench RB"));

  expect(getByText("Workshop")).toBeTruthy();
  expect(getByText("Other Team")).toBeTruthy();
  expect(getByText("TE2")).toBeTruthy();
  expect(getByText("+4.2")).toBeTruthy();
  expect(getByText("+3.1")).toBeTruthy();
  expect(getByText("610")).toBeTruthy();
  expect(getByText("614.2")).toBeTruthy();
  expect(getByText("480")).toBeTruthy();
  expect(getByText("483.1")).toBeTruthy();
  expect(queryByText("You send")).toBeTruthy();
});

test("dismissing the Workshop returns to the suggested trade list", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText, getByText, queryByText } = render(
    <TradeDashboard leagueId="111" />
  );

  fireEvent.press(await findByText("Bench RB"));
  expect(getByText("Workshop")).toBeTruthy();

  fireEvent.press(getByText("Dismiss"));

  expect(queryByText("Workshop")).toBeNull();
  expect(getByText("You send")).toBeTruthy();
  expect(getByText("Bench RB")).toBeTruthy();
});

test("Copy pitch copies names, counterpart team, and deltas without cookies", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText, getByText } = render(<TradeDashboard leagueId="111" />);
  fireEvent.press(await findByText("Bench RB"));
  fireEvent.press(getByText("Copy pitch"));

  expect(copyText).toHaveBeenCalled();
  const pitch = copyText.mock.calls[0][0];
  expect(pitch).toContain("Bench RB");
  expect(pitch).toContain("TE2");
  expect(pitch).toContain("Other Team");
  expect(pitch).toContain("4.2");
  expect(pitch).toContain("3.1");
  expect(pitch).not.toMatch(/espn_s2/i);
  expect(pitch).not.toMatch(/SWID/i);
});
