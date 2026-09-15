import { fireEvent, render } from "@testing-library/react-native";

import { ActionButton, Chip, InlineBanner } from "../ui/primitives";

test("Chip exposes its label and selected state", () => {
  const onPress = jest.fn();
  const { getByTestId } = render(
    <Chip testID="league-chip" label="League A" selected onPress={onPress} />
  );

  const chip = getByTestId("league-chip");
  expect(chip.props.accessibilityRole).toBe("button");
  expect(chip.props.accessibilityLabel).toBe("League A");
  expect(chip.props.accessibilityState.selected).toBe(true);

  fireEvent.press(chip);
  expect(onPress).toHaveBeenCalledTimes(1);
});

test("ActionButton exposes disabled and busy state", () => {
  const onPress = jest.fn();
  const { getByTestId, getByText } = render(
    <ActionButton
      testID="save"
      label="Save leagues"
      busyLabel="Saving leagues"
      busy
      onPress={onPress}
    />
  );

  const button = getByTestId("save");
  expect(button.props.accessibilityRole).toBe("button");
  expect(button.props.accessibilityState).toEqual(
    expect.objectContaining({ busy: true, disabled: true })
  );
  expect(getByText("Saving leagues")).toBeTruthy();
  expect(getByTestId("save-spinner")).toBeTruthy();

  fireEvent.press(button);
  expect(onPress).not.toHaveBeenCalled();
});

test("InlineBanner announces errors and keeps its recovery action usable", () => {
  const onAction = jest.fn();
  const { getByRole, getByText } = render(
    <InlineBanner
      tone="danger"
      title="Connection lost"
      message="Could not reach API"
      actionLabel="Retry"
      onAction={onAction}
    />
  );

  expect(getByRole("alert")).toBeTruthy();
  expect(getByText("Connection lost")).toBeTruthy();
  fireEvent.press(getByText("Retry"));
  expect(onAction).toHaveBeenCalledTimes(1);
});
