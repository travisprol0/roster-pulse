import { render } from "@testing-library/react-native";

import { fetchTrades } from "../api/trades";
import TradeDashboard from "../screens/TradeDashboard";

jest.mock("../api/trades", () => ({
  fetchTrades: jest.fn(),
}));

const mockResponse = {
  trades: [
    {
      id: "t1",
      send: "Bench RB",
      receive: "TE2",
      teamADelta: 4.2,
      teamBDelta: 3.1,
    },
  ],
};

test("shows a loading spinner while fetching trades", () => {
  fetchTrades.mockReturnValue(new Promise(() => {}));

  const { getByTestId } = render(<TradeDashboard />);

  expect(getByTestId("loading")).toBeTruthy();
});

test("renders proposed trades from the mock JSON response", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText } = render(<TradeDashboard />);

  expect(await findByText("Bench RB")).toBeTruthy();
  expect(await findByText("TE2")).toBeTruthy();
});

test("displays projected point deltas for both teams", async () => {
  fetchTrades.mockResolvedValue(mockResponse);

  const { findByText } = render(<TradeDashboard />);

  expect(await findByText("+4.2")).toBeTruthy();
  expect(await findByText("+3.1")).toBeTruthy();
});
