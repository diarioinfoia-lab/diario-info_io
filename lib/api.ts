const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api2.diarioinfo.com';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Auth
export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/me`, { headers: authHeaders() });
  return res.json();
}

export async function updateProfile(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePassword(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/me/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// Articles
export async function getArticles(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/articles${query}`, { headers: authHeaders() });
  return res.json();
}

export async function getPublicArticles(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/articles/public${query}`, { headers: authHeaders() });
  return res.json();
}

export async function createArticle(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateArticle(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/article/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteArticle(id: string) {
  const res = await fetch(`${API_BASE}/article/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Categories
export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders() });
  return res.json();
}

export async function createCategory(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/category/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/category/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Users
export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`, { headers: authHeaders() });
  return res.json();
}

export async function createUser(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/user/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_BASE}/user/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Logs
export async function getLogs() {
  const res = await fetch(`${API_BASE}/logs`, { headers: authHeaders() });
  return res.json();
}

// Notifications
export async function getNotifications() {
  const res = await fetch(`${API_BASE}/notifications`, { headers: authHeaders() });
  return res.json();
}

// Block Templates (Plantillas)
export async function getBlockTemplates() {
  const res = await fetch(`${API_BASE}/block-templates`, { headers: authHeaders() });
  return res.json();
}

export async function createBlockTemplate(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/block-templates`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateBlockTemplate(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/block-template/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBlockTemplate(id: string) {
  const res = await fetch(`${API_BASE}/block-template/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Blocks (Instancias de portada)
export async function getBlocks() {
  const res = await fetch(`${API_BASE}/blocks`, { headers: authHeaders() });
  return res.json();
}

export async function createBlock(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/blocks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateBlock(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/block/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBlock(id: string) {
  const res = await fetch(`${API_BASE}/block/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Playlists
export async function getPlaylists() {
  const res = await fetch(`${API_BASE}/playlists`, { headers: authHeaders() });
  return res.json();
}

// Aliases for backward compatibility
export const login = signIn;

// Additional exports for backward compatibility
export async function getCategory(id: string) {
  const res = await fetch(`${API_BASE}/categories/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function getPublicArticle(id: string) {
  const res = await fetch(`${API_BASE}/articles/public/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function getArticle(id: string) {
  const res = await fetch(`${API_BASE}/articles/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function searchArticles(params: { search?: string; limit?: number; page?: number; categoryId?: string }) {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.limit !== undefined) q.set('limit', String(params.limit));
  if (params.page !== undefined) q.set('page', String(params.page));
  if (params.categoryId) q.set('categoryId', params.categoryId);
  const res = await fetch(`${API_BASE}/articles/public?${q.toString()}`, { headers: authHeaders() });
  return res.json();
}
