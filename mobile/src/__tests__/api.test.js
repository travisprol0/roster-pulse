import { API_BASE } from "../api/config";
import { refreshLeague } from "../api/league";
import { fetchTrades } from "../api/trades";

test("fetchTrades includes league_id query param", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ trades: [] }),
  });

  await fetchTrades("111");

  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE}/api/trades/?league_id=111`
  );
});

test("refreshLeague POSTs league_id to /api/league/refresh/", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ fetchedAt: "2026-09-15T12:00:00Z" }),
  });

  await refreshLeague("111");

  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE}/api/league/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: "111" }),
    }
  );
});
