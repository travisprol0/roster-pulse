export async function parseJsonOk(response) {
  if (response.ok === false) {
    const error = new Error(`http ${response.status}`);
    error.status = response.status;
    try {
      error.body = await response.json();
    } catch {
      error.body = {};
    }
    throw error;
  }
  return response.json();
}
