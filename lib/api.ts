const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api2.diarioinfo.com';

async function fetchAPI(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function fetchAuthAPI(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetchAPI(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
}

// === ARTÍCULOS PÚBLICOS ===
export async function getPublicArticles(params?: { page?: number; limit?: number; categoryId?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.categoryId) q.set('categoryId', params.categoryId);
  if (params?.search) q.set('search', params.search);
  return fetchAPI(`/articles/public?${q}`);
}

export async function getPublicArticle(id: string) {
  return fetchAPI(`/articles/public/${id}`);
}

// === CATEGORÍAS ===
export async function getCategories() {
  return fetchAPI('/categories');
}

export async function getCategory(id: string) {
  return fetchAPI(`/categories/${id}`);
}

// === AUTH ===
export async function login(email: string, password: string) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return fetchAuthAPI('/auth/me');
}

// === ARTÍCULOS (dashboard) ===
export async function getArticles(params?: { page?: number; limit?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search || '');
  return fetchAuthAPI(`/articles?${q}`);
}

export async function getArticle(id: string) {
  return fetchAuthAPI(`/articles/${id}`);
}

export async function createArticle(data: object) {
  return fetchAuthAPI('/articles', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateArticle(id: string, data: object) {
  return fetchAuthAPI(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteArticle(id: string) {
  return fetchAuthAPI(`/articles/${id}`, { method: 'DELETE' });
}

// === CATEGORÍAS (dashboard) ===
export async function createCategory(data: object) {
  return fetchAuthAPI('/categories', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCategory(id: string, data: object) {
  return fetchAuthAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCategory(id: string) {
  return fetchAuthAPI(`/categories/${id}`, { method: 'DELETE' });
}

// === USUARIOS (dashboard) ===
export async function getUsers(params?: { page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return fetchAuthAPI(`/users?${q}`);
}

export async function createUser(data: object) {
  return fetchAuthAPI('/users', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateUser(id: string, data: object) {
  return fetchAuthAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteUser(id: string) {
  return fetchAuthAPI(`/users/${id}`, { method: 'DELETE' });
}

// === NOTIFICACIONES ===
export async function getNotifications() {
  return fetchAuthAPI('/notifications');
}

// === PLAYLISTS ===
export async function getPlaylists() {
  return fetchAuthAPI('/playlists');
}
