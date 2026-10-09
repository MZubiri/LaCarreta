import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const normalizeCartItem = (product) => {
  if (!product) return {};
  const nameEs = product.nameEs || product.name_es || product.name || '';
  const nameEn = product.nameEn || product.name_en || product.name || nameEs;
  const rawPrice = product.price !== undefined ? Number(product.price) : 0;
  return {
    ...product,
    nameEs,
    nameEn,
    name_es: nameEs,
    name_en: nameEn,
    name: nameEs,
    price: isNaN(rawPrice) ? 0 : rawPrice,
    image: product.image || '/images/roses-bouquet.jpg'
  };
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const normalized = normalizeCartItem(product);
    const validQty = Math.max(1, Number(quantity) || 1);
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === normalized.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === normalized.id 
            ? { ...item, ...normalized, quantity: item.quantity + validQty } 
            : item
        );
      }
      return [...prevItems, { ...normalized, quantity: validQty }];
    });
  };

  const removeItem = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + (Number(item.quantity) || 0), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
