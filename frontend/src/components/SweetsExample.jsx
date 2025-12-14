import React, { useEffect, useState } from 'react';
import { getSweets, createSweet, deleteSweet } from '../services/sweetService';

export default function SweetsExample() {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await getSweets();
      setSweets(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    try {
      await createSweet({ name: 'Sample', category: 'Test', price: 1, quantity: 1 });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSweet(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h4 className="font-bold mb-2">Sweets (example service usage)</h4>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="flex gap-2 mb-4">
        <button onClick={load} className="px-3 py-1 bg-gray-200 rounded">Refresh</button>
        <button onClick={handleAdd} className="px-3 py-1 bg-green-200 rounded">Add Sample</button>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <ul>
          {sweets.map(s => (
            <li key={s.id} className="flex items-center justify-between py-1">
              <span>{s.name} — ${s.price}</span>
              <button onClick={() => handleDelete(s.id)} className="text-red-500">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
