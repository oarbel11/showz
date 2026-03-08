const API_URL = '/api';

function getToken() {
  return localStorage.getItem('showz_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// Auth
export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};

// Users
export const usersApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users?${query}`);
  },
  get: (id) => request(`/users/${id}`),
  update: (id, body) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  uploadAvatar: async (id, file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API_URL}/users/${id}/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  // Credits (actor filmography)
  getCredits: (id) => request(`/users/${id}/credits`),
  addCredit: (id, body) => request(`/users/${id}/credits`, { method: 'POST', body: JSON.stringify(body) }),
  deleteCredit: (id, creditId) => request(`/users/${id}/credits/${creditId}`, { method: 'DELETE' }),
};

// Jobs
export const jobsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jobs?${query}`);
  },
  mine: () => request('/jobs/mine'),
  get: (id) => request(`/jobs/${id}`),
  create: (body) => request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
};

// Chat
export const chatApi = {
  conversations: () => request('/chat/conversations'),
  messages: (convId) => request(`/chat/conversations/${convId}/messages`),
  startConversation: (userId) => request('/chat/conversations', { method: 'POST', body: JSON.stringify({ userId }) }),
  sendMessage: (convId, content) => request(`/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
};

// Applications
export const applicationsApi = {
  apply: async (jobId, cv, message) => {
    const token = getToken();
    const formData = new FormData();
    if (cv) formData.append('cv', cv);
    if (message) formData.append('message', message);
    const res = await fetch(`${API_URL}/applications/${jobId}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Application failed');
    return data;
  },
  getApplications: (jobId) => request(`/applications/${jobId}`),
};

// Notifications
export const notificationsApi = {
  list: () => request('/applications/notifications/all'),
  markRead: () => request('/applications/notifications/read', { method: 'PUT' }),
};
