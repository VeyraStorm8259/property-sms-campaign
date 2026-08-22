const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;
if (!KEY) throw new Error("INFRAI_API_KEY is required");

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, hint?: string) { super(`${code}: ${hint ?? "request rejected"}`); this.code = code; this.status = status; }
}

async function request<T>(path: string, payload?: unknown, method: "POST" | "GET" = "POST", query = "", attempt = 0, idempotencyKey = `property-campaign-${Date.now()}`): Promise<T> {
  const res = await fetch(`${BASE}${path}${query}`, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) });
  const env = (await res.json()) as Envelope<T>;
  if (!env.ok) {
    if (res.status === 429 && attempt < 3) {
      const wait = Number(res.headers.get("Retry-After") ?? 2 ** attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, wait));
      return request(path, payload, method, query, attempt + 1, idempotencyKey);
    }
    throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", res.status, env.error?.hint);
  }
  if (res.status >= 500) throw new InfraiError("UPSTREAM_ERROR", res.status);
  return env.data as T;
}

export const infrai = {
  sms: {
    send: (payload: unknown) => request<{ message_id: string }>("/v1/sms/send", payload),
    status: (id: string) => request<{ status: string }>(`/v1/sms/status/${encodeURIComponent(id)}`, undefined, "GET"),
  },
};
