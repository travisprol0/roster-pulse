import { fireEvent, render } from "@testing-library/react-native";

import { saveEspnCredentials } from "../api/espnCredentials";
import SettingsScreen from "../screens/SettingsScreen";

jest.mock("../api/espnCredentials", () => ({
  saveEspnCredentials: jest.fn(),
}));

const payload = {
  leagueId: "12345",
  espn_s2: "s2-token",
  swid: "{TEST-SWID}",
};

test("submitting settings sends credentials to the backend", () => {
  const { getByPlaceholderText, getByText } = render(<SettingsScreen />);

  fireEvent.changeText(getByPlaceholderText("League ID"), payload.leagueId);
  fireEvent.changeText(getByPlaceholderText("espn_s2"), payload.espn_s2);
  fireEvent.changeText(getByPlaceholderText("swid"), payload.swid);
  fireEvent.press(getByText("Submit"));

  expect(saveEspnCredentials).toHaveBeenCalledTimes(1);
  expect(saveEspnCredentials).toHaveBeenCalledWith(payload);
});
