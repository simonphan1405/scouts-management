const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const TOKEN_COOKIE_NAME = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // Đọc từ cookie
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_COOKIE_NAME}=([^;]*)`),
  );
  if (match) return decodeURIComponent(match[1]);

  // Fallback đọc từ localStorage
  return localStorage.getItem(TOKEN_COOKIE_NAME);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;

  // Lưu vào cookie (7 ngày)
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; path=/; max-age=604800; SameSite=Lax`;

  // Đồng bộ với localStorage
  localStorage.setItem(TOKEN_COOKIE_NAME, token);
}

export function removeToken() {
  if (typeof window === "undefined") return;

  // Xóa cookie
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

  // Xóa localStorage
  localStorage.removeItem(TOKEN_COOKIE_NAME);
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers: customHeaders, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const query = searchParams.toString();
    if (query) {
      url += (url.includes("?") ? "&" : "?") + query;
    }
  }

  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Yêu cầu thất bại với mã lỗi ${response.status}`;
    try {
      const errBody = await response.json();
      errorMsg = errBody.message || errBody.error || errorMsg;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
