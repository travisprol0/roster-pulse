import { render, waitFor } from "@testing-library/react-native";

import { fetchLeague } from "../api/league";
import LeagueBoard from "../screens/LeagueBoard";

jest.mock("../api/league", () => ({
  fetchLeague: jest.fn(() => Promise.resolve({ youTeamId: null, teams: [] })),
}));

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
  const { getByText, getByTestId } = render(<LeagueBoard leagueId="12345" />);

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
  expect(getByText("BE")).toBeTruthy();
  expect(getByText("OUT")).toBeTruthy();
  expect(getByText("TE2")).toBeTruthy();
  expect(getByTestId("team-1")).toBeTruthy();
  expect(getByTestId("team-2")).toBeTruthy();
});
