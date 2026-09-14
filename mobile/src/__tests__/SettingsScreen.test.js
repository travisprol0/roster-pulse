import { fireEvent, render } from "@testing-library/react-native";

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
    leagues: [
      { leagueId: "111", espn_s2: "s2-a", swid: "{A}" },
      { leagueId: "222", espn_s2: "s2-b", swid: "{B}" },
    ],
  });
});
