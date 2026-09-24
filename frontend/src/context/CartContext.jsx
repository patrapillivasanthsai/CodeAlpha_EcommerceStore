import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const LOCAL_CART_KEY = 'codealpha_guest_cart';

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper to read guest cart from localStorage
  const getGuestCart = () => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Helper to save guest cart to localStorage
  const saveGuestCart = (items) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  };

  // Fetch cart from database for authenticated users
  const fetchDbCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/cart');
      if (res.data.success) {
        setCartItems(res.data.cart.items || []);
        setSubtotal(res.data.cart.subtotal || 0);
      }
    } catch (err) {
      console.error('Error fetching backend cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update cart state when auth changes
  useEffect(() => {
    const handleCartSync = async () => {
      if (isAuthenticated) {
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          // Merge guest cart to DB
          try {
            const itemsToMerge = guestItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            }));
            await API.post('/cart/merge', { items: itemsToMerge });
            localStorage.removeItem(LOCAL_CART_KEY);
          } catch (err) {
            console.error('Failed to merge guest cart:', err);
          }
        }
        await fetchDbCart();
      } else {
        // Load guest cart
        const guest = getGuestCart();
        setCartItems(guest);
        const sub = guest.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setSubtotal(parseFloat(sub.toFixed(2)));
      }
    };

    handleCartSync();
  }, [isAuthenticated, fetchDbCart]);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await API.post('/cart', {
          productId: product.id,
          quantity,
        });
        if (res.data.success) {
          await fetchDbCart();
          return { success: true, message: res.data.message };
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to add item to cart.';
        return { success: false, message: msg };
      }
    } else {
      // Guest Cart logic
      const guestItems = getGuestCart();
      const existingIndex = guestItems.findIndex((i) => i.productId === product.id);

      let newQuantity = quantity;
      if (existingIndex > -1) {
        newQuantity += guestItems[existingIndex].quantity;
      }

      if (newQuantity > product.stock_quantity) {
        return {
          success: false,
          message: `Only ${product.stock_quantity} units of "${product.name}" are in stock.`,
        };
      }

      let updated;
      if (existingIndex > -1) {
        updated = [...guestItems];
        updated[existingIndex].quantity = newQuantity;
        updated[existingIndex].itemTotal = parseFloat((product.price * newQuantity).toFixed(2));
      } else {
        updated = [
          ...guestItems,
          {
            cartItemId: `guest_${product.id}_${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            imageUrl: product.image_url,
            category: product.category,
            stockQuantity: product.stock_quantity,
            quantity,
            itemTotal: parseFloat((product.price * quantity).toFixed(2)),
          },
        ];
      }

      saveGuestCart(updated);
      setCartItems(updated);
      const sub = updated.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setSubtotal(parseFloat(sub.toFixed(2)));
      return { success: true, message: `Added "${product.name}" to cart.` };
    }
  };

  // Update item quantity
  const updateQuantity = async (cartItemId, newQuantity, productId) => {
    if (newQuantity <= 0) {
      return removeFromCart(cartItemId, productId);
    }

    if (isAuthenticated) {
      try {
        const res = await API.put(`/cart/${cartItemId}`, { quantity: newQuantity });
        if (res.data.success) {
          await fetchDbCart();
          return { success: true };
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update cart.';
        return { success: false, message: msg };
      }
    } else {
      const guestItems = getGuestCart();
      const item = guestItems.find((i) => i.cartItemId === cartItemId || i.productId === productId);
      if (item && newQuantity > item.stockQuantity) {
        return {
          success: false,
          message: `Only ${item.stockQuantity} units available.`,
        };
      }

      const updated = guestItems.map((i) => {
        if (i.cartItemId === cartItemId || i.productId === productId) {
          return {
            ...i,
            quantity: newQuantity,
            itemTotal: parseFloat((i.price * newQuantity).toFixed(2)),
          };
        }
        return i;
      });

      saveGuestCart(updated);
      setCartItems(updated);
      const sub = updated.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setSubtotal(parseFloat(sub.toFixed(2)));
      return { success: true };
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId, productId) => {
    if (isAuthenticated) {
      try {
        const res = await API.delete(`/cart/${cartItemId}`);
        if (res.data.success) {
          await fetchDbCart();
          return { success: true };
        }
      } catch (err) {
        return { success: false, message: 'Failed to remove item.' };
      }
    } else {
      const guestItems = getGuestCart();
      const updated = guestItems.filter(
        (i) => i.cartItemId !== cartItemId && i.productId !== productId
      );
      saveGuestCart(updated);
      setCartItems(updated);
      const sub = updated.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setSubtotal(parseFloat(sub.toFixed(2)));
      return { success: true };
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await API.delete('/cart');
        setCartItems([]);
        setSubtotal(0);
      } catch (err) {
        console.error('Failed to clear DB cart:', err);
      }
    } else {
      localStorage.removeItem(LOCAL_CART_KEY);
      setCartItems([]);
      setSubtotal(0);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchDbCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
