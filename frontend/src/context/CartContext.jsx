import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export const CartContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (user && user.role === 'Buyer') {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/cart`, getAuthHeaders());
        setCart(data.data || { items: [] });
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCart({ items: [] });
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please login as Buyer to add items to cart');
      return;
    }
    if (user.role !== 'Buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/cart`, { productId, quantity }, getAuthHeaders());
      setCart(data.data);
      toast.success('Added to Cart 🛒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await axios.put(`${API_URL}/cart/${itemId}`, { quantity }, getAuthHeaders());
      setCart(data.data);
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await axios.delete(`${API_URL}/cart/${itemId}`, getAuthHeaders());
      setCart(data.data);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/cart`, getAuthHeaders());
      setCart({ items: [] });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const totalItems = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart.items?.reduce((sum, item) => {
    const price = item.productId?.price || item.price || 0;
    return sum + (item.quantity * price);
  }, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
