import { fireEvent, render } from "@testing-library/react-native";

import LeagueSwitcher from "../screens/LeagueSwitcher";

const leagues = [
  { id: "111", name: "League A" },
  { id: "222", name: "League B" },
];

test("shows leagues and selects by id without cookies", () => {
  const onSelect = jest.fn();
  const { getByText } = render(
    <LeagueSwitcher leagues={leagues} onSelect={onSelect} />
  );

  expect(getByText("League A")).toBeTruthy();
  expect(getByText("League B")).toBeTruthy();

  fireEvent.press(getByText("League B"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith("222");
  expect(onSelect.mock.calls[0][0]).not.toHaveProperty("espn_s2");
  expect(onSelect.mock.calls[0][0]).not.toHaveProperty("swid");
});
