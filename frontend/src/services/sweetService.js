import api from './api';

export async function getSweets() {
  const res = await api.get('/api/sweets');
  return res.data;
}

export async function searchSweets(query) {
  const res = await api.get('/api/sweets/search', { params: { query } });
  return res.data;
}

export async function createSweet(sweet) {
  const res = await api.post('/api/sweets', sweet);
  return res.data;
}

export async function updateSweet(id, sweet) {
  const res = await api.put(`/api/sweets/${id}`, sweet);
  return res.data;
}

export async function deleteSweet(id) {
  const res = await api.delete(`/api/sweets/${id}`);
  return res.data;
}

export async function purchaseSweet(id) {
  const res = await api.post(`/api/sweets/${id}/purchase`);
  return res.data;
}

export async function restockSweet(id, amount = 1) {
  const res = await api.post(`/api/sweets/${id}/restock?quantity=${amount}`);
  return res.data;
}
