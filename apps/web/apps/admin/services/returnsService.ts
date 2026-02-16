// services/returnsService.ts
import { 
  ReturnRequest, 
  Refund, 
  Exchange, 
  ReturnReason, 
  ReturnPolicy,
  ReturnAnalytics
} from '../api/src/modules/returns/interfaces/returns.interface';
import { 
  CreateReturnRequestDto, 
  UpdateReturnRequestDto, 
  CreateRefundDto, 
  UpdateRefundDto, 
  CreateExchangeDto,
  CreateReturnReasonDto,
  UpdateReturnReasonDto,
  CreateReturnPolicyDto,
  UpdateReturnPolicyDto
} from '../api/src/modules/returns/dto/returns.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the returns API
 */
export class ReturnsService {
  /**
   * Creates a new return request
   */
  static async createReturnRequest(data: CreateReturnRequestDto): Promise<ReturnRequest> {
    const response = await fetch(`${API_BASE_URL}/returns/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create return request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a return request
   */
  static async updateReturnRequest(id: string, data: UpdateReturnRequestDto): Promise<ReturnRequest> {
    const response = await fetch(`${API_BASE_URL}/returns/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update return request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a return request by ID
   */
  static async getReturnRequestById(id: string): Promise<ReturnRequest> {
    const response = await fetch(`${API_BASE_URL}/returns/requests/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch return request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets return requests by order ID
   */
  static async getReturnRequestsByOrder(orderId: string): Promise<ReturnRequest[]> {
    const response = await fetch(`${API_BASE_URL}/returns/requests/order/${orderId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch return requests for order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets return requests by customer ID
   */
  static async getReturnRequestsByCustomer(customerId: string): Promise<ReturnRequest[]> {
    const response = await fetch(`${API_BASE_URL}/returns/requests/customer/${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch return requests for customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets return requests by status
   */
  static async getReturnRequestsByStatus(status: string): Promise<ReturnRequest[]> {
    const response = await fetch(`${API_BASE_URL}/returns/requests/status/${status}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch return requests with status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a refund
   */
  static async createRefund(data: CreateRefundDto): Promise<Refund> {
    const response = await fetch(`${API_BASE_URL}/returns/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create refund: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a refund
   */
  static async updateRefund(id: string, data: UpdateRefundDto): Promise<Refund> {
    const response = await fetch(`${API_BASE_URL}/returns/refunds/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update refund: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates an exchange
   */
  static async createExchange(data: CreateExchangeDto): Promise<Exchange> {
    const response = await fetch(`${API_BASE_URL}/returns/exchanges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create exchange: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets return reasons
   */
  static async getReturnReasons(): Promise<ReturnReason[]> {
    const response = await fetch(`${API_BASE_URL}/returns/reasons`);

    if (!response.ok) {
      throw new Error(`Failed to fetch return reasons: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a return reason
   */
  static async createReturnReason(data: CreateReturnReasonDto): Promise<ReturnReason> {
    const response = await fetch(`${API_BASE_URL}/returns/reasons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create return reason: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets return policies
   */
  static async getReturnPolicies(): Promise<ReturnPolicy[]> {
    const response = await fetch(`${API_BASE_URL}/returns/policies`);

    if (!response.ok) {
      throw new Error(`Failed to fetch return policies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a return policy
   */
  static async createReturnPolicy(data: CreateReturnPolicyDto): Promise<ReturnPolicy> {
    const response = await fetch(`${API_BASE_URL}/returns/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create return policy: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets return analytics
   */
  static async getReturnAnalytics(period: string): Promise<ReturnAnalytics> {
    const response = await fetch(`${API_BASE_URL}/returns/analytics/${period}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch return analytics: ${response.statusText}`);
    }

    return response.json();
  }
}