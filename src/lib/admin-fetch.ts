/** Parse admin API JSON responses and surface HTTP errors consistently. */
export async function adminFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const payload = data as { error?: string | Record<string, unknown> } | null;
    if (typeof payload?.error === "string") {
      throw new Error(payload.error);
    }
    throw new Error(`Request failed (${res.status})`);
  }

  return data as T;
}
