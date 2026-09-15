import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { fetchEvaluate } from "../api/evaluate";
import { fetchLeague, refreshLeague } from "../api/league";
import { copyText } from "../clipboard";
import LeagueBoard from "../screens/LeagueBoard";

jest.mock("../api/league", () => ({
  fetchLeague: jest.fn(() => Promise.resolve({ youTeamId: null, teams: [] })),
  refreshLeague: jest.fn(() => Promise.resolve({ fetchedAt: "2026-09-15T12:00:00Z" })),
}));

jest.mock("../api/evaluate", () => ({
  fetchEvaluate: jest.fn(),
}));

jest.mock(
  "../clipboard",
  () => ({
    copyText: jest.fn(() => Promise.resolve()),
  }),
  { virtual: true }
);

const board = {
  youTeamId: 1,
  teams: [
    {
      id: 1,
      name: "User Team",
      isYou: true,
      record: { wins: 3, losses: 1, ties: 0 },
      pointsFor: 412.2,
      pointsAgainst: 380.1,
      playoffSeed: 2,
      waiverRank: 5,
      surplusNeed: ["RB+", "TE-"],
      players: [
        {
          id: "a-rb3",
          name: "Bench RB",
          position: "RB",
          slot: "BE",
          projectedPts: 90,
          actualPts: 8,
          injury: "",
          positionRank: 3,
          recommendedStarter: true,
        },
        {
          id: "a-te",
          name: "Weak TE",
          position: "TE",
          slot: "TE",
          projectedPts: 20,
          actualPts: 2,
          injury: "OUT",
          positionRank: 3,
          recommendedStarter: true,
        },
        {
          id: "a-rb-sit",
          name: "Sit RB",
          position: "RB",
          slot: "BE",
          projectedPts: 1,
          actualPts: 0,
          injury: "",
          positionRank: 4,
          recommendedStarter: false,
        },
      ],
    },
    {
      id: 2,
      name: "Other Team",
      isYou: false,
      record: { wins: 1, losses: 3, ties: 0 },
      pointsFor: 300,
      pointsAgainst: 400,
      playoffSeed: 8,
      waiverRank: 2,
      surplusNeed: ["RB-", "TE+"],
      players: [
        {
          id: "b-te2",
          name: "TE2",
          position: "TE",
          slot: "TE",
          projectedPts: 75,
          actualPts: 20,
          injury: "",
          positionRank: 2,
        },
      ],
    },
  ],
};

test("prompts to add a league when none selected", () => {
  const { getByText } = render(<LeagueBoard leagueId={null} />);
  expect(getByText("Add a league in settings, then pick it here.")).toBeTruthy();
});

test("renders standings and roster rows for every team", async () => {
  fetchLeague.mockResolvedValueOnce(board);
  const { getByText, getByTestId, queryByText, getAllByText } = render(<LeagueBoard leagueId="12345" />);

  await waitFor(() => getByText("User Team"));

  expect(fetchLeague).toHaveBeenCalledWith("12345");
  expect(getByText("You")).toBeTruthy();
  expect(getByText("3-1-0")).toBeTruthy();
  expect(getByText("PF 412.2")).toBeTruthy();
  expect(getByText("PA 380.1")).toBeTruthy();
  expect(getByText("Seed 2")).toBeTruthy();
  expect(getByText("Waivers 5")).toBeTruthy();
  expect(getByText("Other Team")).toBeTruthy();
  expect(getByText("1-3-0")).toBeTruthy();
  expect(getByText("Bench RB")).toBeTruthy();
  expect(getAllByText("BE").length).toBeGreaterThan(0);
  expect(getByText("OUT")).toBeTruthy();
  expect(queryByText("TE2")).toBeNull();
  expect(getByTestId("team-1")).toBeTruthy();
  expect(getByTestId("team-2")).toBeTruthy();
});

test("other team's roster stays collapsed until the team header is pressed", async () => {
  fetchLeague.mockResolvedValueOnce(board);
  const { getByText, queryByText } = render(<LeagueBoard leagueId="12345" />);

  await waitFor(() => getByText("Bench RB"));
  expect(queryByText("TE2")).toBeNull();

  fireEvent.press(getByText("Other Team"));

  expect(getByText("TE2")).toBeTruthy();
});

const evaluateResponse = {
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
  mutual: true,
};

test("pressing your player then an opponent player opens the Workshop", async () => {
  fetchLeague.mockResolvedValueOnce(board);
  fetchEvaluate.mockResolvedValueOnce(evaluateResponse);

  const { getByText, getAllByText, findByText, queryByText } = render(
    <LeagueBoard leagueId="12345" />
  );
  await waitFor(() => getByText("Bench RB"));
  expect(queryByText("TE2")).toBeNull();
  fireEvent.press(getByText("Other Team"));

  fireEvent.press(getByText("Bench RB"));
  fireEvent.press(getByText("TE2"));

  await waitFor(() => expect(fetchEvaluate).toHaveBeenCalledWith("12345", "a-rb3", "b-te2"));
  expect(await findByText("Workshop")).toBeTruthy();
  expect(getAllByText("Other Team").length).toBeGreaterThan(1);
  expect(getByText("+4.2")).toBeTruthy();
  expect(getByText("+3.1")).toBeTruthy();
  expect(getByText("610")).toBeTruthy();
  expect(getByText("614.2")).toBeTruthy();
  expect(getByText("480")).toBeTruthy();
  expect(getByText("483.1")).toBeTruthy();
});

test("pressing an opponent player then your player opens the same Workshop", async () => {
  fetchLeague.mockResolvedValueOnce(board);
  fetchEvaluate.mockResolvedValueOnce(evaluateResponse);

  const { getByText, getAllByText, findByText, queryByText } = render(
    <LeagueBoard leagueId="12345" />
  );
  await waitFor(() => getByText("Bench RB"));
  expect(queryByText("TE2")).toBeNull();
  fireEvent.press(getByText("Other Team"));

  fireEvent.press(getByText("TE2"));
  fireEvent.press(getByText("Bench RB"));

  await waitFor(() => expect(fetchEvaluate).toHaveBeenCalledWith("12345", "a-rb3", "b-te2"));
  expect(await findByText("Workshop")).toBeTruthy();
  expect(getAllByText("Other Team").length).toBeGreaterThan(1);
});

test("Clear selection dismisses the Workshop", async () => {
  fetchLeague.mockResolvedValueOnce(board);
  fetchEvaluate.mockResolvedValueOnce(evaluateResponse);

  const { getByText, findByText, queryByText } = render(
    <LeagueBoard leagueId="12345" />
  );
  await waitFor(() => getByText("Bench RB"));
  fireEvent.press(getByText("Other Team"));

  fireEvent.press(getByText("Bench RB"));
  fireEvent.press(getByText("TE2"));
  expect(await findByText("Workshop")).toBeTruthy();

  fireEvent.press(getByText("Clear selection"));

  expect(queryByText("Workshop")).toBeNull();
  expect(getByText("Bench RB")).toBeTruthy();
  expect(getByText("TE2")).toBeTruthy();
});

test("Copy pitch copies names, counterpart team, and deltas without cookies", async () => {
  fetchLeague.mockResolvedValueOnce(board);
  fetchEvaluate.mockResolvedValueOnce(evaluateResponse);

  const { getByText, findByText } = render(<LeagueBoard leagueId="12345" />);
  await waitFor(() => getByText("Bench RB"));
  fireEvent.press(getByText("Other Team"));

  fireEvent.press(getByText("Bench RB"));
  fireEvent.press(getByText("TE2"));
  expect(await findByText("Workshop")).toBeTruthy();

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

test("search filters to the matching player and team", async () => {
  fetchLeague.mockResolvedValueOnce(board);

  const { getByPlaceholderText, getByText, queryByText, findByText } = render(
    <LeagueBoard leagueId="12345" />
  );
  expect(await findByText("Bench RB")).toBeTruthy();

  fireEvent.changeText(getByPlaceholderText("Search players"), "te2");

  expect(getByText("TE2")).toBeTruthy();
  expect(getByText("Other Team")).toBeTruthy();
  expect(queryByText("Bench RB")).toBeNull();
  expect(queryByText("Weak TE")).toBeNull();
});

test("sorting by proj puts the highest projectedPts player first", async () => {
  fetchLeague.mockResolvedValueOnce({
    youTeamId: 1,
    teams: [
      {
        id: 1,
        name: "User Team",
        isYou: true,
        record: { wins: 0, losses: 0, ties: 0 },
        pointsFor: 0,
        pointsAgainst: 0,
        playoffSeed: 1,
        waiverRank: 1,
        players: [
          {
            id: "low",
            name: "Low Proj",
            position: "WR",
            slot: "WR",
            projectedPts: 10,
            actualPts: 1,
            injury: "",
            positionRank: 2,
          },
          {
            id: "high",
            name: "High Proj",
            position: "RB",
            slot: "RB",
            projectedPts: 99,
            actualPts: 20,
            injury: "",
            positionRank: 1,
          },
        ],
      },
    ],
  });

  const { findByText, getByText, getAllByText } = render(
    <LeagueBoard leagueId="12345" />
  );
  expect(await findByText("Low Proj")).toBeTruthy();
  expect(getByText("Sort: Slot")).toBeTruthy();

  let names = getAllByText(/^(Low Proj|High Proj)$/).map(
    (node) => node.props.children
  );
  expect(names[0]).toBe("Low Proj");

  fireEvent.press(getByText("Sort: Slot"));

  expect(getByText("Sort: Proj")).toBeTruthy();
  names = getAllByText(/^(Low Proj|High Proj)$/).map((node) => node.props.children);
  expect(names[0]).toBe("High Proj");
});

test("Start and Sit badges show on your team only", async () => {
  fetchLeague.mockResolvedValueOnce(board);

  const { findByText, getByText, getAllByText } = render(
    <LeagueBoard leagueId="12345" />
  );
  expect(await findByText("Bench RB")).toBeTruthy();
  expect(getAllByText("Start").length).toBeGreaterThan(0);
  expect(getByText("Sit")).toBeTruthy();
});

test("surplus need strip is visible on team cards", async () => {
  fetchLeague.mockResolvedValueOnce(board);

  const { findByText, getByText } = render(<LeagueBoard leagueId="12345" />);
  expect(await findByText("TE-")).toBeTruthy();
  expect(getByText("TE+")).toBeTruthy();
  expect(getByText("RB+")).toBeTruthy();
  expect(getByText("RB-")).toBeTruthy();
});

test("Refresh press calls the refresh API helper", async () => {
  fetchLeague.mockResolvedValueOnce({
    ...board,
    fetchedAt: "2026-09-15T12:00:00Z",
  });
  refreshLeague.mockResolvedValueOnce({ fetchedAt: "2026-09-15T13:00:00Z" });

  const { getByText, findByText } = render(<LeagueBoard leagueId="12345" />);
  expect(await findByText("User Team")).toBeTruthy();

  fireEvent.press(getByText("Refresh"));

  expect(refreshLeague).toHaveBeenCalledWith("12345");
});

test("shows last synced time from fetchedAt", async () => {
  fetchLeague.mockResolvedValueOnce({
    ...board,
    fetchedAt: "2026-09-15T12:00:00Z",
  });

  const { findByText } = render(<LeagueBoard leagueId="12345" />);
  expect(await findByText("2026-09-15T12:00:00Z")).toBeTruthy();
});

test("injured starter row is marked and healthy row is not", async () => {
  fetchLeague.mockResolvedValueOnce(board);

  const { findByText, getByTestId, queryByTestId } = render(
    <LeagueBoard leagueId="12345" />
  );
  expect(await findByText("Weak TE")).toBeTruthy();
  expect(getByTestId("injury-starter-a-te")).toBeTruthy();
  expect(queryByTestId("injury-starter-a-rb3")).toBeNull();
  expect(queryByTestId("injury-starter-a-rb-sit")).toBeNull();
});
