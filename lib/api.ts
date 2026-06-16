const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api2.diarioinfo.com';

async function fetchAPI(path: string, options: RequestInit = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  return res.json();
}

async function fetchAuthAPI(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetchAPI(path, {
    ...options,
    headers: { 'Authorization': token ? `Bearer ${token}` : '', ...options.headers },
  });
}

// === PUBLIC ===
export async function getPublicArticles(params?: { page?: number; limit?: number; categoryId?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.categoryId) q.set('categoryId', params.categoryId);
  if (params?.search) q.set('search', params.search);
  return fetchAPI('/articles/public?' + q.toString());
}

export async function getPublicArticle(id: string) {
  return fetchAPI(`/articles/public/${id}`);
}

export async function getCategories() {
  return fetchAPI('/categories');
}

export async function getCategory(id: string) {
  return fetchAPI(`/categories/${id}`);
}

// === AUTH ===
export async function login(email: string, password: string) {
  const data = await fetchAPI('/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function register(data: { email: string; password: string; name: string }) {
  return fetchAPI('/signup', { method: 'POST', body: JSON.stringify(data) });
}

export async function getMe() {
  return fetchAuthAPI('/me');
}

export async function updateMe(data: object) {
  return fetchAuthAPI('/me', { method: 'PUT', body: JSON.stringify(data) });
}

// Alias para profile page
export const updateProfile = updateMe;

export async function updatePassword(data: { currentPassword: string; newPassword: string }) {
  return fetchAuthAPI('/me/password', { method: 'PUT', body: JSON.stringify(data) });
}

// === ARTICLES ===
export async function getArticles(params?: { page?: number; limit?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search);
  const qs = q.toString();
  return fetchAuthAPI('/articles' + (qs ? '?' + qs : ''));
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

// === CATEGORIES ===
export async function createCategory(data: object) {
  return fetchAuthAPI('/categories', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCategory(id: string, data: object) {
  return fetchAuthAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCategory(id: string) {
  return fetchAuthAPI(`/categories/${id}`, { method: 'DELETE' });
}

// === USERS ===
export async function getUsers(params?: { page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return fetchAuthAPI('/users' + (qs ? '?' + qs : ''));
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

// === NOTIFICATIONS ===
export async function getNotifications() {
  return fetchAuthAPI('/notifications');
}

// === LOGS ===
export async function getLogs(params?: { page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return fetchAuthAPI('/logs' + (qs ? '?' + qs : ''));
}

// === PLAYLISTS ===
export async function getPlaylists() {
  return fetchAuthAPI('/playlists');
}
