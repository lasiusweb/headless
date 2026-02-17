'use client';

import { useState, useEffect } from 'react';
import { api } from './supabase';

/**
 * Dashboard Data Hook
 * Fetches dashboard metrics and recent activity
 */
export function useDashboard() {
  const [data, setData] = useState({
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      totalSpent: 0,
      creditLimit: 0,
      pendingPayments: 0,
      activeTickets: 0,
    },
    recentOrders: [],
    notifications: [],
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/dashboard/stats'),
      ]);

      if (ordersRes.data && !ordersRes.error) {
        setData(prev => ({
          ...prev,
          recentOrders: ordersRes.data.slice(0, 5),
          stats: {
            ...prev.stats,
            totalOrders: ordersRes.data.length,
            pendingOrders: ordersRes.data.filter((o: any) => o.status === 'pending_approval').length,
            totalSpent: ordersRes.data
              .filter((o: any) => o.payment_status === 'paid')
              .reduce((sum: number, o: any) => sum + o.total, 0),
          },
        }));
      }

      if (statsRes.data && !statsRes.error) {
        setData(prev => ({
          ...prev,
          stats: { ...prev.stats, ...statsRes.data },
        }));
      }
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        error: error.message,
      }));
    } finally {
      setData(prev => ({ ...prev, loading: false }));
    }
  }

  return { ...data, refresh: loadDashboardData };
}

/**
 * Knowledge Centre Hook
 * Fetches articles, FAQs, guides, and tutorials
 */
export function useKnowledgeCentre() {
  const [data, setData] = useState({
    articles: [],
    faqs: [],
    guides: [],
    tutorials: [],
    categories: [],
    loading: true,
  });

  useEffect(() => {
    loadKnowledgeData();
  }, []);

  async function loadKnowledgeData() {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        api.get('/knowledge-centre/articles?limit=6'),
        api.get('/knowledge-centre/categories'),
      ]);

      setData(prev => ({
        ...prev,
        articles: articlesRes.data || [],
        categories: categoriesRes.data || [],
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading knowledge data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  }

  async function searchKnowledge(query: string) {
    const res = await api.get(`/knowledge-centre/search?q=${encodeURIComponent(query)}`);
    return res.data || [];
  }

  return { ...data, searchKnowledge };
}

/**
 * Support Hook
 * Manages support tickets and feedback
 */
export function useSupport() {
  const [data, setData] = useState({
    tickets: [],
    loading: true,
  });

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const res = await api.get('/support/tickets/my-tickets');
      setData(prev => ({
        ...prev,
        tickets: res.data || [],
        loading: false,
      }));
    } catch (error) {
      setData(prev => ({ ...prev, loading: false }));
    }
  }

  async function createTicket(ticketData: {
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) {
    const res = await api.post('/support/tickets', ticketData);
    if (res.data) {
      loadTickets();
    }
    return res;
  }

  async function submitFeedback(feedbackData: {
    type: string;
    subject: string;
    message: string;
  }) {
    return await api.post('/support/feedback', feedbackData);
  }

  async function reportEmergency(emergencyData: {
    type: string;
    description: string;
    productId?: string;
    orderId?: string;
    contactPhone: string;
  }) {
    return await api.post('/support/emergency', emergencyData);
  }

  return { 
    ...data, 
    createTicket, 
    submitFeedback, 
    reportEmergency,
    refreshTickets: loadTickets 
  };
}

/**
 * Resources Hook
 * Manages documents, wishlist, coupons, and reviews
 */
export function useResources() {
  const [data, setData] = useState({
    documents: [],
    wishlist: [],
    coupons: [],
    reviews: [],
    loading: true,
  });

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      const [docsRes, wishlistRes, couponsRes, reviewsRes] = await Promise.all([
        api.get('/resources/documents'),
        api.get('/resources/wishlist'),
        api.get('/resources/coupons'),
        api.get('/resources/reviews'),
      ]);

      setData(prev => ({
        ...prev,
        documents: docsRes.data || [],
        wishlist: wishlistRes.data || [],
        coupons: couponsRes.data || [],
        reviews: reviewsRes.data || [],
        loading: false,
      }));
    } catch (error) {
      setData(prev => ({ ...prev, loading: false }));
    }
  }

  async function addToWishlist(productId: string) {
    const res = await api.post('/resources/wishlist', { productId });
    if (res.data) {
      loadResources();
    }
    return res;
  }

  async function removeFromWishlist(itemId: string) {
    const res = await api.delete(`/resources/wishlist/${itemId}`);
    if (res.data) {
      loadResources();
    }
    return res;
  }

  async function claimInviteCode(code: string) {
    return await api.post('/resources/invite-code/claim', { code });
  }

  return { 
    ...data, 
    addToWishlist, 
    removeFromWishlist, 
    claimInviteCode,
    refreshResources: loadResources 
  };
}

/**
 * Orders Hook
 * Manages order-related operations
 */
export function useOrders() {
  const [data, setData] = useState({
    orders: [],
    loading: true,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders(filters?: any) {
    try {
      const queryParams = new URLSearchParams(filters || {}).toString();
      const res = await api.get(`/orders/my-orders${queryParams ? `?${queryParams}` : ''}`);
      setData(prev => ({
        ...prev,
        orders: res.data || [],
        loading: false,
      }));
    } catch (error) {
      setData(prev => ({ ...prev, loading: false }));
    }
  }

  async function getOrderById(orderId: string) {
    return await api.get(`/orders/${orderId}`);
  }

  async function trackOrder(orderId: string) {
    return await api.get(`/orders/${orderId}/tracking`);
  }

  async function downloadInvoice(orderId: string) {
    return await api.get(`/orders/${orderId}/invoice/download`);
  }

  return { 
    ...data, 
    getOrderById, 
    trackOrder, 
    downloadInvoice,
    refreshOrders: loadOrders 
  };
}
