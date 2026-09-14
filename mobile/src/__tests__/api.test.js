import { API_BASE } from "../api/config";
import { fetchTrades } from "../api/trades";

test("fetchTrades includes league_id query param", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ trades: [] }),
  });

  await fetchTrades("111");

  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE}/api/trades/?league_id=111`
  );
});
