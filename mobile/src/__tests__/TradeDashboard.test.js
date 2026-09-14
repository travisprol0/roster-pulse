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

const twoTeamResponse = {
  trades: [
    {
      id: "t1",
      send: "Bench RB",
      receive: "TE2",
      sendId: "a-rb3",
      receiveId: "b-te2",
      sendPosition: "RB",
      receivePosition: "TE",
      teamBId: 2,
      teamBName: "Other Team",
      teamADelta: 4.2,
      teamBDelta: 3.1,
      beforeA: 610,
      afterA: 614.2,
      beforeB: 480,
      afterB: 483.1,
    },
    {
      id: "t2",
      send: "Weak TE",
      receive: "WR1",
      sendId: "a-te",
      receiveId: "c-wr1",
      sendPosition: "TE",
      receivePosition: "WR",
      teamBId: 3,
      teamBName: "Rival Team",
      teamADelta: 2.0,
      teamBDelta: 1.5,
      beforeA: 610,
      afterA: 612,
      beforeB: 400,
      afterB: 401.5,
    },
  ],
};

test("opponent filter hides the other counterpart team's rows", async () => {
  fetchTrades.mockResolvedValue(twoTeamResponse);

  const { findByText, getByText, getByTestId, queryByText } = render(
    <TradeDashboard leagueId="111" />
  );
  expect(await findByText("Bench RB")).toBeTruthy();
  expect(getByText("Weak TE")).toBeTruthy();

  fireEvent.press(getByTestId("filter-opponent-3"));

  expect(queryByText("Bench RB")).toBeNull();
  expect(getByText("Weak TE")).toBeTruthy();
  expect(getByText("Rival Team")).toBeTruthy();
});

test("position filter keeps rows where send or receive matches", async () => {
  fetchTrades.mockResolvedValue(twoTeamResponse);

  const { findByText, getByText, getByTestId, queryByText } = render(
    <TradeDashboard leagueId="111" />
  );
  expect(await findByText("Bench RB")).toBeTruthy();

  fireEvent.press(getByTestId("filter-position-RB"));

  expect(getByText("Bench RB")).toBeTruthy();
  expect(queryByText("Weak TE")).toBeNull();
});

test("sort toggle relabels and reorders fairness vs your gain", async () => {
  fetchTrades.mockResolvedValue({
    trades: [
      {
        id: "greedy",
        send: "Greedy send",
        receive: "Cheap TE",
        teamBId: 2,
        teamBName: "Other Team",
        teamADelta: 10,
        teamBDelta: 0.5,
      },
      {
        id: "fair",
        send: "Fair send",
        receive: "TE2",
        teamBId: 2,
        teamBName: "Other Team",
        teamADelta: 4.2,
        teamBDelta: 3.1,
      },
    ],
  });

  const { findByText, getByText, getAllByText } = render(
    <TradeDashboard leagueId="111" />
  );
  expect(await findByText("Fairness")).toBeTruthy();

  let names = getAllByText(/^(Fair send|Greedy send)$/).map(
    (node) => node.props.children
  );
  expect(names).toEqual(["Fair send", "Greedy send"]);

  fireEvent.press(getByText("Fairness"));

  expect(getByText("Your gain")).toBeTruthy();
  names = getAllByText(/^(Fair send|Greedy send)$/).map(
    (node) => node.props.children
  );
  expect(names).toEqual(["Greedy send", "Fair send"]);
});

test("2-for-1 mode lists two names on one side", async () => {
  fetchTrades.mockResolvedValueOnce({ trades: [] });
  fetchTrades.mockResolvedValueOnce({
    trades: [
      {
        id: "2for1",
        send: "Bench RB + WR2",
        receive: "TE2",
        teamBId: 2,
        teamBName: "Other Team",
        teamADelta: 4.0,
        teamBDelta: 5.0,
      },
    ],
  });

  const { findByText, getByText } = render(<TradeDashboard leagueId="111" />);
  expect(await findByText("No mutually beneficial trades.")).toBeTruthy();
  expect(getByText("1-for-1")).toBeTruthy();

  fireEvent.press(getByText("2-for-1"));

  await waitFor(() => expect(fetchTrades).toHaveBeenCalledWith("111", "2for1"));
  expect(await findByText("Bench RB + WR2")).toBeTruthy();
  expect(getByText("TE2")).toBeTruthy();
});
