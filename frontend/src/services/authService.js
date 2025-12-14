import api from './api';

export async function register(email, password) {
  const res = await api.post('/api/auth/register', { email, password });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post('/api/auth/login', { email, password });
  const { access_token, user } = res.data;
  localStorage.setItem('token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
  return res.data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}
