import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/api';
import BackButton from '../../components/BackButton';
import { FaSeedling, FaUpload, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    price: '',
    quantity: '',
    location: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const msg = 'Image must be JPG, PNG, WEBP, or AVIF.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const msg = 'Image size must be below 10MB.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('location', formData.location);

      if (imageFile) {
        data.append('image', imageFile);
      }

      await createProduct(data);
      toast.success('Crop added to marketplace successfully! 🎉');
      navigate('/farmer/my-products');
    } catch (err) {
      const msg = err.response?.data?.message || 'Crop upload failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-fade-in">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label="Back to Dashboard" />
      </div>

      <div className="card-saas p-8 shadow-premium">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-700 to-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-md">
            <FaSeedling />
          </div>
          <div>
            <h1 className="page-heading text-2xl font-display">List Fresh Harvest</h1>
            <p className="text-xs text-surface-500 font-medium">Publish produce directly to buyers with zero broker cuts</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Crop Title / Produce Name</label>
            <input
              name="name"
              placeholder="e.g. Organic Kesar Mango, Desi Wheat"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-saas text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Crop Description</label>
            <textarea
              name="description"
              placeholder="Freshly harvested, organic farm produce..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
              className="input-saas resize-none text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-saas text-xs font-bold text-brand-900 bg-emerald-50/50 border-emerald-200"
              >
                <option value="Vegetables">🥦 Vegetables</option>
                <option value="Fruits">🍎 Fruits</option>
                <option value="Grains">🌾 Grains</option>
                <option value="Pulses">🫘 Pulses</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Farm Location</label>
              <input
                name="location"
                placeholder="Navsari, Gujarat"
                value={formData.location}
                onChange={handleChange}
                required
                className="input-saas text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Price per Unit (₹)</label>
              <input
                name="price"
                type="number"
                placeholder="40"
                value={formData.price}
                onChange={handleChange}
                required
                className="input-saas text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Quantity in Stock</label>
              <input
                name="quantity"
                type="number"
                placeholder="200"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="input-saas text-xs font-medium"
              />
            </div>
          </div>

          {/* Image Upload & Live Thumbnail */}
          <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-2">
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <FaUpload className="text-brand-700" /> Upload Produce Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-surface-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-brand-900 hover:file:bg-emerald-200 cursor-pointer"
            />
            {imagePreview ? (
              <div className="pt-2">
                <p className="text-xs font-bold text-brand-800 mb-1">Preview:</p>
                <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-2xl border border-surface-200 shadow-sm" />
              </div>
            ) : (
              <p className="text-xs text-surface-400 italic font-medium">Select a clear photograph of your farm crop</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-saas-primary text-xs !py-3.5 mt-4 shadow-sm disabled:opacity-50 font-bold"
          >
            {loading ? 'Publishing Crop Listing...' : 'Publish to Marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
