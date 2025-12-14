import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertCircle, Candy, LogOut, Plus, Search, Edit, Trash2, User, X } from 'lucide-react';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from './services/authService';
import { getSweets as fetchSweets, createSweet as createSweetSvc, updateSweet as updateSweetSvc, deleteSweet as deleteSweetSvc, purchaseSweet as purchaseSweetSvc, restockSweet as restockSweetSvc } from './services/sweetService';
import SweetsExample from './components/SweetsExample';

// ============================================================================
// CONTEXT & AUTH
// ============================================================================

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = getCurrentUser();
    if (userData) setUser(userData);
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    // store is handled by `authService.login`, but support manual set as well
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = {
  getHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  },

  async register(username, email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return response.json();
  },

  async getSweets() {
    const response = await fetch(`${API_BASE_URL}/api/sweets`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch sweets');
    return response.json();
  },

  async searchSweets(query) {
    const response = await fetch(`${API_BASE_URL}/api/sweets/search?query=${encodeURIComponent(query)}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  async createSweet(sweetData) {
    const response = await fetch(`${API_BASE_URL}/api/sweets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(sweetData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create sweet');
    }
    return response.json();
  },

  async updateSweet(id, sweetData) {
    const response = await fetch(`${API_BASE_URL}/api/sweets/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(sweetData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update sweet');
    }
    return response.json();
  },

  async deleteSweet(id) {
    const response = await fetch(`${API_BASE_URL}/api/sweets/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to delete sweets. Admin access required.');
      }
      throw new Error(error.detail || 'Failed to delete sweet');
    }
    return response.json();
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Alert Component
const Alert = ({ type = 'info', message, onClose }) => {
  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[type]} flex items-start gap-3 mb-4`}>
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Candy className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Sweet Shop</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <User className="w-5 h-5" />
                <span className="font-medium">{user.username}</span>
                {user.is_admin && (
                  <span className="bg-yellow-400 text-purple-900 px-2 py-0.5 rounded text-xs font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Login Page
const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) return;
    
    setError('');
    setLoading(true);

    try {
      const data = await authLogin(username, password);
      // authLogin stores token/user in localStorage
      login(data.access_token, data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Candy className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-600 mt-2">Login to manage your sweet shop</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-pink-500 font-semibold hover:text-pink-600"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username || !email || !password) return;
    
    setError('');
    setLoading(true);

    try {
      await authRegister(email, password);
      const loginData = await authLogin(email, password);
      login(loginData.access_token, loginData.user);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Candy className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our sweet shop management</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !username || !email || !password}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-pink-500 font-semibold hover:text-pink-600"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Sweet Form Modal
const SweetFormModal = ({ sweet, onClose, onSuccess }) => {
  const [name, setName] = useState(sweet?.name || '');
  const [category, setCategory] = useState(sweet?.category || '');
  const [price, setPrice] = useState(sweet?.price || '');
  const [quantity
, setquantity
] = useState(sweet?.quantity
 || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !category || !price || !quantity
) return;
    
    setError('');
    setLoading(true);

    try {
      const sweetData = {
        name,
        category,
        price: parseFloat(price),
        quantity
: parseInt(quantity
)
      };

      if (sweet) {
        await updateSweetSvc(sweet.id, sweetData);
      } else {
        await createSweetSvc(sweetData);
      }
      
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {sweet ? 'Edit Sweet' : 'Add New Sweet'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              quantity

            </label>
            <input
              type="number"
              value={quantity
}
              onChange={(e) => setquantity
(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name || !category || !price || !quantity
}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : (sweet ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sweet List Page
const SweetListPage = () => {
  const { user } = useAuth();
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [restockAmounts, setRestockAmounts] = useState({});

  const loadSweets = async () => {
      try {
        setLoading(true);
        const data = await fetchSweets();
        setSweets(data);
        setFilteredSweets(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load sweets');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = sweets.filter(
        sweet =>
          sweet.name.toLowerCase().includes(query) ||
          sweet.category.toLowerCase().includes(query)
      );
      setFilteredSweets(filtered);
    } else {
      setFilteredSweets(sweets);
    }
  }, [searchQuery, sweets]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sweet?')) return;

    try {
      await deleteSweetSvc(id);
      setSuccess('Sweet deleted successfully!');
      loadSweets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePurchase = async (id) => {
    try {
      await purchaseSweetSvc(id);
      await loadSweets();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestock = async (id) => {
    const amount = parseInt(restockAmounts[id] || 1, 10) || 1;
    try {
      await restockSweetSvc(id, amount);
      setRestockAmounts(prev => ({ ...prev, [id]: '' }));
      await loadSweets();
      setSuccess('Sweet restocked successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (sweet) => {
    setSelectedSweet(sweet);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedSweet(null);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setSuccess(selectedSweet ? 'Sweet updated successfully!' : 'Sweet added successfully!');
    loadSweets();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sweets by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Sweet
          </button>
        </div>

        {/* Example usage of the new `sweetService` API layer */}
        <SweetsExample />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading sweets...</p>
          </div>
        ) : filteredSweets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Candy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'No sweets found matching your search.' : 'No sweets available. Add your first sweet!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSweets.map((sweet) => (
              <div key={sweet.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-32 flex items-center justify-center">
                  <Candy className="w-16 h-16 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{sweet.name}</h3>
                  <p className="text-gray-600 mb-4">
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {sweet.category}
                    </span>
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-pink-600">${sweet.price.toFixed(2)}</span>
                    <span className="text-gray-600">
                      quantity
: <span className="font-semibold">{sweet.quantity
}</span>
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handlePurchase(sweet.id)}
                      disabled={sweet.quantity === 0}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      Purchase
                    </button>
                    <button
                      onClick={() => handleEdit(sweet)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    {user?.is_admin && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={restockAmounts[sweet.id] ?? ''}
                          onChange={(e) => setRestockAmounts(prev => ({ ...prev, [sweet.id]: e.target.value }))}
                          placeholder="amt"
                          className="w-16 px-2 py-1 border rounded"
                        />
                        <button
                          onClick={() => handleRestock(sweet.id)}
                          className="bg-yellow-400 text-purple-900 px-3 py-1 rounded"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleDelete(sweet.id)}
                          className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <SweetFormModal
          sweet={selectedSweet}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

const App = () => {
  const [page, setPage] = useState('login');
  
  return (
    <AuthProvider>
      <AuthRouter page={page} setPage={setPage} />
    </AuthProvider>
  );
};

const AuthRouter = ({ page, setPage }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (page === 'register') {
      return <RegisterPage onNavigate={setPage} />;
    }
    return <LoginPage onNavigate={setPage} />;
  }

  return <SweetListPage />;
};

export default App;