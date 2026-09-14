import { fireEvent, render } from "@testing-library/react-native";

import LeagueSwitcher from "../screens/LeagueSwitcher";

const leagues = [
  { id: "111", name: "League A" },
  { id: "222", name: "League B" },
];

test("pressing League B selects by id and marks it selected", () => {
  const onSelect = jest.fn();
  const { getByText, getByTestId, rerender } = render(
    <LeagueSwitcher leagues={leagues} onSelect={onSelect} selectedId="111" />
  );

  fireEvent.press(getByText("League B"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith("222");
  expect(onSelect.mock.calls[0][0]).not.toHaveProperty("espn_s2");
  expect(onSelect.mock.calls[0][0]).not.toHaveProperty("swid");

  rerender(
    <LeagueSwitcher leagues={leagues} onSelect={onSelect} selectedId="222" />
  );
  expect(getByTestId("league-tab-222").props.accessibilityState.selected).toBe(
    true
  );
  expect(getByTestId("league-tab-111").props.accessibilityState.selected).toBe(
    false
  );
});
