const API = 'https://api2.diarioinfo.com';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function handleUnauth(status: number) {
  if (status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/signin';
  }
}

async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    handleUnauth(401);
    return res;
  }
  return res;
}


export async function signIn(email: string, password: string) {
  const res = await authFetch(`${API}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export const login = signIn;

export async function getMe() {
  const res = await authFetch(`${API}/me`, { headers: authHeaders() });
  return res.json();
}

export async function updateMe(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getUsers(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/users?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function createUser(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  const res = await authFetch(`${API}/user/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await authFetch(`${API}/user/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

export async function getCategories(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/categories?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function getCategory(id: string) {
  const res = await authFetch(`${API}/category/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function createCategory(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  const res = await authFetch(`${API}/category/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await authFetch(`${API}/category/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

export async function getPublicArticles(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/articles?${q}`);
  return res.json();
}

export async function getPublicArticle(id: string) {
  const res = await authFetch(`${API}/article/${id}`);
  return res.json();
}

export async function getArticles(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/articles?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function getArticle(id: string) {
  const res = await authFetch(`${API}/article/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function createArticle(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/articles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateArticle(id: string, data: Record<string, unknown>) {
  const res = await authFetch(`${API}/article/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteArticle(id: string) {
  const res = await authFetch(`${API}/article/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

export async function getLogs(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/logs?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function getNotifications(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/notifications?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function markNotificationRead(id: string) {
  const res = await authFetch(`${API}/notification/${id}/read`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  return res.json();
}

export async function getSettings() {
  const res = await authFetch(`${API}/settings`, { headers: authHeaders() });
  return res.json();
}

export async function updateSettings(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/settings`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// Block Templates
export async function getBlockTemplates(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/block-templates?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function createBlockTemplate(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/block-templates`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateBlockTemplate(id: string, data: Record<string, unknown>) {
  const res = await authFetch(`${API}/block-template/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBlockTemplate(id: string) {
  const res = await authFetch(`${API}/block-template/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Blocks (Portada)
export async function getBlocks(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/blocks?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function createBlock(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/blocks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateBlock(id: string, data: Record<string, unknown>) {
  const res = await authFetch(`${API}/block/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBlock(id: string) {
  const res = await authFetch(`${API}/block/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Playlists
export async function getPlaylists(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const res = await authFetch(`${API}/playlists?${q}`, { headers: authHeaders() });
  return res.json();
}

export async function createPlaylist(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/playlists`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePlaylist(id: string, data: Record<string, unknown>) {
  const res = await authFetch(`${API}/playlist/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePlaylist(id: string) {
  const res = await authFetch(`${API}/playlist/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Profile
export async function updateProfile(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePassword(data: Record<string, unknown>) {
  const res = await authFetch(`${API}/me/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
