import { API_BASE } from "./config";

export async function saveEspnCredentials(payload) {
  const url = `${API_BASE}/api/espn-credentials/`;
  // #region agent log
  fetch("http://127.0.0.1:7257/ingest/09ed06f5-2a1a-412c-960f-6f6e174b9c44", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1de000",
    },
    body: JSON.stringify({
      sessionId: "1de000",
      hypothesisId: "C",
      location: "espnCredentials.js:saveEspnCredentials",
      message: "POST espn-credentials",
      data: { url, apiBase: API_BASE },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
