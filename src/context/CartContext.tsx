'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, OrderData } from '@/types';
import { SHIPPING_POLICY } from '@/data/morocco';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Cart Drawer
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  
  // Quick 1-Click COD Checkout Modal (Beez.ma style)
  quickCheckoutItem: CartItem | null;
  openQuickCheckout: (item: CartItem) => void;
  closeQuickCheckout: () => void;
  
  // Size Guide Modal
  isSizeGuideOpen: boolean;
  openSizeGuide: () => void;
  closeSizeGuide: () => void;
  
  // Calculations
  totalItemsCount: number;
  subtotal: number;
  embroideryTotal: number;
  shippingFee: number;
  total: number;

  // Last completed order for /merci page
  lastOrder: OrderData | null;
  setLastOrder: (order: OrderData) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickCheckoutItem, setQuickCheckoutItem] = useState<CartItem | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [lastOrder, setLastOrderState] = useState<OrderData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('blouseti_cart');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      const savedOrder = localStorage.getItem('blouseti_last_order');
      if (savedOrder) {
        setLastOrderState(JSON.parse(savedOrder));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save items to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('blouseti_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      // Check if identical item (same product id, same color, same size, same embroidery config) exists
      const existingIndex = prev.findIndex(
        (i) =>
          i.product.id === newItem.product.id &&
          i.selectedColor.name === newItem.selectedColor.name &&
          i.selectedSize === newItem.selectedSize &&
          JSON.stringify(i.embroidery) === JSON.stringify(newItem.embroidery)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openQuickCheckout = (item: CartItem) => {
    setQuickCheckoutItem(item);
  };

  const closeQuickCheckout = () => {
    setQuickCheckoutItem(null);
  };

  const openSizeGuide = () => setIsSizeGuideOpen(true);
  const closeSizeGuide = () => setIsSizeGuideOpen(false);

  const setLastOrder = (order: OrderData) => {
    setLastOrderState(order);
    try {
      localStorage.setItem('blouseti_last_order', JSON.stringify(order));
    } catch (e) {
      console.error('Failed to save order to localStorage', e);
    }
  };

  // Calculations
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const embroideryTotal = items.reduce(
    (acc, item) =>
      acc + (item.embroidery?.enabled ? (item.embroidery.price || 20) * item.quantity : 0),
    0
  );

  const grossTotal = subtotal + embroideryTotal;
  const shippingFee = grossTotal === 0 ? 0 : grossTotal >= SHIPPING_POLICY.freeShippingThreshold ? 0 : SHIPPING_POLICY.standardRate;
  const total = grossTotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        quickCheckoutItem,
        openQuickCheckout,
        closeQuickCheckout,
        isSizeGuideOpen,
        openSizeGuide,
        closeSizeGuide,
        totalItemsCount,
        subtotal,
        embroideryTotal,
        shippingFee,
        total,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
