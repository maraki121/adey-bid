import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://adey-bid-8k87.onrender.com/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://adey-bid-8k87.onrender.com/api/admin/categories', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setName('');
      loadCategories();
      alert('Category added!');
    } catch (error) {
      alert(error.response?.data?.error || 'Error adding category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://adey-bid-8k87.onrender.com/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadCategories();
    } catch (error) {
      alert('Error deleting');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/admin')} className="mb-4 text-purple-600 hover:underline">
          ← Back to Admin
        </button>

        <h1 className="text-3xl font-bold mb-6">Categories</h1>

        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-lg mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Add
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-xl shadow-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.auction_count || 0} auctions</p>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">
                🗑️
              </button>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No categories yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}