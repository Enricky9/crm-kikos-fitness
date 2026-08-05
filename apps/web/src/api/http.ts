import type { ApiErrorResponse } from "@kikos/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly payload: ApiErrorResponse
  ) {
    super(payload.error.message);
  }
}

type RequestOptions = {
  readonly method?: "GET" | "POST" | "PATCH";
  readonly body?: unknown;
  readonly token?: string | null;
};

export const apiRequest = async <TResponse>(path: string, options: RequestOptions = {}) => {
  const headers = new Headers({
    Accept: "application/json"
  });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const payload = (await response.json()) as TResponse;

  if (!response.ok) {
    throw new HttpError(response.status, payload as ApiErrorResponse);
  }

  return payload;
};
