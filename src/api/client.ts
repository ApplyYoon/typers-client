export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include', // HttpOnly 쿠키 자동 전송
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? '요청에 실패했습니다');
  }

  // 204 No Content 등 body 없는 응답 처리
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const api = {
  get:   <T>(path: string)               => request<T>(path),
  post:  <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
