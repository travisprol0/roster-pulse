const API_URL = "http://localhost:8000/api/trades/";

export async function fetchTrades() {
  const response = await fetch(API_URL);
  return response.json();
}
