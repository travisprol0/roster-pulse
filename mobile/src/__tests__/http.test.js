import { parseJsonOk } from "../api/http";

test("ok response returns json", async () => {
  const data = await parseJsonOk({
    ok: true,
    json: async () => ({ leagues: [] }),
  });
  expect(data).toEqual({ leagues: [] });
});

test("false ok throws", async () => {
  await expect(
    parseJsonOk({
      ok: false,
      status: 500,
      json: async () => ({ error: "nope" }),
    })
  ).rejects.toMatchObject({ status: 500 });
});
