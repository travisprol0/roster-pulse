import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { saveEspnCredentials } from "../api/espnCredentials";
import SettingsScreen from "../screens/SettingsScreen";

jest.mock("../api/espnCredentials", () => ({
  saveEspnCredentials: jest.fn(() => Promise.resolve()),
}));

test("shows a league block with league id and both cookies", () => {
  const { getByPlaceholderText, getByText } = render(<SettingsScreen />);

  expect(getByPlaceholderText("League ID 1")).toBeTruthy();
  expect(getByPlaceholderText("espn_s2")).toBeTruthy();
  expect(getByPlaceholderText("swid")).toBeTruthy();
  expect(getByText("League ID")).toBeTruthy();
  expect(getByText("espn_s2")).toBeTruthy();
  expect(getByText("SWID")).toBeTruthy();
  expect(getByPlaceholderText("2026")).toBeTruthy();
});

test("collapses cookie fields when saved leagues exist until Leagues / cookies is pressed", () => {
  const { queryByPlaceholderText, getByPlaceholderText, getByText } = render(
    <SettingsScreen savedLeagues={[{ id: "111", name: "League A" }]} />
  );

  expect(queryByPlaceholderText("League ID 1")).toBeNull();
  expect(queryByPlaceholderText("espn_s2")).toBeNull();
  expect(queryByPlaceholderText("swid")).toBeNull();

  fireEvent.press(getByText("Leagues / cookies"));

  expect(getByPlaceholderText("League ID 1")).toBeTruthy();
  expect(getByPlaceholderText("espn_s2")).toBeTruthy();
  expect(getByPlaceholderText("swid")).toBeTruthy();
});

test("Add league still works when expanded after sync", () => {
  const { getByText } = render(
    <SettingsScreen savedLeagues={[{ id: "111", name: "League A" }]} />
  );

  fireEvent.press(getByText("Leagues / cookies"));
  fireEvent.press(getByText("Add league"));

  expect(getByText("League 2")).toBeTruthy();
});

test("submitting two league blocks sends cookies per league", () => {
  const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(
    <SettingsScreen />
  );

  fireEvent.press(getByText("Add league"));

  fireEvent.changeText(getByPlaceholderText("League ID 1"), "111");
  fireEvent.changeText(getAllByPlaceholderText("espn_s2")[0], "s2-a");
  fireEvent.changeText(getAllByPlaceholderText("swid")[0], "{A}");
  fireEvent.changeText(getByPlaceholderText("League ID 2"), "222");
  fireEvent.changeText(getAllByPlaceholderText("espn_s2")[1], "s2-b");
  fireEvent.changeText(getAllByPlaceholderText("swid")[1], "{B}");
  fireEvent.press(getByText("Submit"));

  expect(saveEspnCredentials).toHaveBeenCalledTimes(1);
  expect(saveEspnCredentials).toHaveBeenCalledWith({
    season: 2026,
    leagues: [
      { leagueId: "111", espn_s2: "s2-a", swid: "{A}" },
      { leagueId: "222", espn_s2: "s2-b", swid: "{B}" },
    ],
  });
});

test("Submit payload includes the chosen season", () => {
  const { getByPlaceholderText, getByText } = render(<SettingsScreen />);

  fireEvent.changeText(getByPlaceholderText("League ID 1"), "111");
  fireEvent.changeText(getByPlaceholderText("espn_s2"), "s2-a");
  fireEvent.changeText(getByPlaceholderText("swid"), "{A}");
  fireEvent.changeText(getByPlaceholderText("2026"), "2025");
  fireEvent.press(getByText("Submit"));

  expect(saveEspnCredentials).toHaveBeenCalledWith({
    season: 2025,
    leagues: [{ leagueId: "111", espn_s2: "s2-a", swid: "{A}" }],
  });
});

test("shows unauthorized copy without cookie values", async () => {
  saveEspnCredentials.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      leagues: [{ league_id: 111, account_id: null, status: "unauthorized" }],
    }),
  });

  const { getByPlaceholderText, getByText } = render(<SettingsScreen />);
  fireEvent.changeText(getByPlaceholderText("League ID 1"), "111");
  fireEvent.changeText(getByPlaceholderText("espn_s2"), "s2-secret");
  fireEvent.changeText(getByPlaceholderText("swid"), "{SWID-SECRET}");
  fireEvent.press(getByText("Submit"));

  const message = await waitFor(() => getByText("Could not sync: unauthorized"));
  expect(message).toBeTruthy();
  expect(String(message.props.children)).not.toMatch(/s2-secret/);
  expect(String(message.props.children)).not.toMatch(/SWID-SECRET/);
});
