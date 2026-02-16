import { supabase } from './supabase';

export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
    }
    
    return {
      'Content-Type': 'application/json',
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        return {
          data: null,
          error: { message: error.message || 'Request failed', status: response.status },
        };
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Network error', status: 0 },
      };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        return {
          data: null,
          error: { message: error.message || 'Request failed', status: response.status },
        };
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Network error', status: 0 },
      };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        return {
          data: null,
          error: { message: error.message || 'Request failed', status: response.status },
        };
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Network error', status: 0 },
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        return {
          data: null,
          error: { message: error.message || 'Request failed', status: response.status },
        };
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Network error', status: 0 },
      };
    }
  }
}

export const api = new ApiClient();

// API type definitions
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  mrp: number;
  dealer_price: number;
  distributor_price: number;
  gst_rate: number;
  sku: string;
  image_urls?: string[];
  category?: { name: string; slug: string };
  segment?: { name: string; slug: string };
}

export interface Cart {
  id: string;
  items: CartItem[];
  pricing: {
    subtotal: number;
    discount: number;
    gstRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
    itemCount: number;
  };
}

export interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  variant: {
    name: string;
    sku: string;
    mrp: number;
    dealer_price: number;
    distributor_price: number;
    product: {
      name: string;
      slug: string;
      description: string;
    };
  };
}

export interface Order {
  id: string;
  order_number: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}
