import { API_BASE } from "./config";

export async function fetchLeagues() {
  const response = await fetch(`${API_BASE}/api/leagues/`);
  return response.json();
}
