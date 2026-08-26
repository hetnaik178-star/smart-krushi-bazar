import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteProduct } from '../../services/api';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import SmartImage from '../../components/SmartImage';
import { FaBox, FaPlus, FaEdit, FaTrashAlt, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getMyProducts();
      setProducts(data || []);
    } catch (err) {
      toast.error('Failed to load crop listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Crop removed from marketplace');
      } catch (err) {
        toast.error('Failed to delete crop');
      }
    }
  };

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label="Back to Dashboard" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <FaLeaf className="text-brand-600" /> Farm Inventory
          </div>
          <h1 className="page-heading flex items-center gap-3">
            Active Farm Crop Listings
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Manage active harvest inventory, price updates, and available stock units.</p>
        </div>
        <Link to="/farmer/add-product" className="btn-saas-primary text-xs flex items-center gap-2 shadow-sm font-bold">
          <FaPlus /> List New Crop
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-20 skeleton-shimmer"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card-saas p-8">
          <EmptyState
            icon={FaBox}
            title="No Crops Listed Yet"
            description="You haven't listed any farm produce for sale yet. Add your first harvest to connect directly with verified buyers."
            actionText="List Your First Crop"
            actionLink="/farmer/add-product"
          />
        </div>
      ) : (
        <div className="card-saas overflow-hidden shadow-premium">
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Crop Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price / Unit</th>
                  <th className="px-6 py-4">Available Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <SmartImage
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-surface-200 shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-surface-900 font-display">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{p.price}</td>
                    <td className="px-6 py-4 font-bold text-surface-700">{p.quantity} units</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/farmer/edit-product/${p._id}`}
                        className="btn-saas-secondary text-xs !py-1.5 !px-3 inline-flex items-center gap-1"
                      >
                        <FaEdit className="text-brand-600" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="btn-saas-secondary text-xs !py-1.5 !px-3 inline-flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
