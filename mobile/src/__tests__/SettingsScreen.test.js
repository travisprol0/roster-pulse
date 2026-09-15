import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { saveEspnCredentials } from "../api/espnCredentials";
import SettingsScreen from "../screens/SettingsScreen";

jest.mock("../api/espnCredentials", () => ({
  saveEspnCredentials: jest.fn(() => Promise.resolve({ leagues: [{ status: "ok" }] })),
}));

jest.mock("../api/leagues", () => ({
  deleteLeague: jest.fn(() => Promise.resolve({ ok: true })),
}));

test("shows a league block with league id and no cookie fields", () => {
  const { getByPlaceholderText, getByText, queryByPlaceholderText, queryByText } =
    render(<SettingsScreen />);

  expect(getByPlaceholderText("League ID 1")).toBeTruthy();
  expect(getByText("League ID")).toBeTruthy();
  expect(getByPlaceholderText("2026")).toBeTruthy();
  expect(queryByPlaceholderText("espn_s2")).toBeNull();
  expect(queryByPlaceholderText("swid")).toBeNull();
  expect(queryByText("espn_s2")).toBeNull();
  expect(queryByText("SWID")).toBeNull();
});

test("collapses league fields when saved leagues exist until Leagues is pressed", () => {
  const {
    queryByPlaceholderText,
    getByPlaceholderText,
    getByTestId,
  } = render(
    <SettingsScreen savedLeagues={[{ id: "111", name: "League A" }]} />
  );

  expect(queryByPlaceholderText("League ID 1")).toBeNull();
  expect(getByTestId("settings-toggle").props.accessibilityRole).toBe("button");
  expect(
    getByTestId("settings-toggle").props.accessibilityState.expanded
  ).toBe(false);

  fireEvent.press(getByTestId("settings-toggle"));

  expect(getByPlaceholderText("League ID 1")).toBeTruthy();
  expect(
    getByTestId("settings-toggle").props.accessibilityState.expanded
  ).toBe(true);
});

test("Add league still works when expanded after sync", () => {
  const { getByText } = render(
    <SettingsScreen savedLeagues={[{ id: "111", name: "League A" }]} />
  );

  fireEvent.press(getByText("Leagues"));
  fireEvent.press(getByText("Add league"));

  expect(getByText("League 2")).toBeTruthy();
});

test("submitting two league blocks sends league ids only", async () => {
  const { getByPlaceholderText, getByText, getByTestId } = render(
    <SettingsScreen />
  );

  fireEvent.press(getByText("Add league"));

  fireEvent.changeText(getByPlaceholderText("League ID 1"), "111");
  fireEvent.changeText(getByPlaceholderText("League ID 2"), "222");
  fireEvent.press(getByText("Submit"));

  expect(saveEspnCredentials).toHaveBeenCalledTimes(1);
  expect(saveEspnCredentials).toHaveBeenCalledWith({
    season: 2026,
    leagues: [{ leagueId: "111" }, { leagueId: "222" }],
  });
  await waitFor(() =>
    expect(getByTestId("settings-submit").props.accessibilityState.busy).toBe(
      false
    )
  );
});

test("Submit payload includes the chosen season", async () => {
  const { getByPlaceholderText, getByTestId, getByText } = render(
    <SettingsScreen />
  );

  fireEvent.changeText(getByPlaceholderText("League ID 1"), "111");
  fireEvent.changeText(getByPlaceholderText("2026"), "2025");
  fireEvent.press(getByText("Submit"));

  expect(saveEspnCredentials).toHaveBeenCalledWith({
    season: 2025,
    leagues: [{ leagueId: "111" }],
  });
  await waitFor(() =>
    expect(getByTestId("settings-submit").props.accessibilityState.busy).toBe(
      false
    )
  );
});

test("announces unauthorized copy without cookie values", async () => {
  saveEspnCredentials.mockResolvedValueOnce({
    leagues: [{ league_id: 111, account_id: null, status: "unauthorized" }],
  });

  const { getByPlaceholderText, getByRole, getByTestId, getByText } = render(
    <SettingsScreen />
  );
  fireEvent.changeText(getByPlaceholderText("League ID 1"), "111");
  fireEvent.press(getByText("Submit"));

  const message = await waitFor(() => getByText("Could not sync: unauthorized"));
  expect(message).toBeTruthy();
  expect(String(message.props.children)).not.toMatch(/espn_s2/i);
  expect(getByRole("alert")).toBeTruthy();
  await waitFor(() =>
    expect(getByTestId("settings-submit").props.accessibilityState.busy).toBe(
      false
    )
  );
});
