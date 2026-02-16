// services/posService.ts
import { 
  PosDevice, 
  PosSession, 
  PosTransaction, 
  PosProduct, 
  PosCustomer, 
  PosInventoryAdjustment,
  PosSyncLog 
} from '../api/src/modules/pos/interfaces/pos.interface';
import { 
  CreatePosTransactionDto, 
  UpdatePosTransactionDto, 
  CreatePosProductDto, 
  UpdatePosProductDto, 
  CreatePosCustomerDto, 
  UpdatePosCustomerDto, 
  PosInventoryAdjustmentDto,
  StartPosSessionDto,
  ClosePosSessionDto,
  RegisterPosDeviceDto 
} from '../api/src/modules/pos/dto/pos.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the POS API
 */
export class PosService {
  /**
   * Starts a new POS session
   */
  static async startSession(data: StartPosSessionDto): Promise<PosSession> {
    const response = await fetch(`${API_BASE_URL}/pos/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to start POS session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Closes a POS session
   */
  static async closeSession(data: ClosePosSessionDto): Promise<PosSession> {
    const response = await fetch(`${API_BASE_URL}/pos/session/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to close POS session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a new POS transaction
   */
  static async createTransaction(data: CreatePosTransactionDto): Promise<PosTransaction> {
    const response = await fetch(`${API_BASE_URL}/pos/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create POS transaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a POS transaction
   */
  static async updateTransaction(id: string, data: UpdatePosTransactionDto): Promise<PosTransaction> {
    const response = await fetch(`${API_BASE_URL}/pos/transaction/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update POS transaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a POS transaction by ID
   */
  static async getTransactionById(id: string): Promise<PosTransaction> {
    const response = await fetch(`${API_BASE_URL}/pos/transaction/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch POS transaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets POS transactions by session ID
   */
  static async getTransactionsBySession(sessionId: string): Promise<PosTransaction[]> {
    const response = await fetch(`${API_BASE_URL}/pos/transaction/session/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch POS transactions for session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a new POS product
   */
  static async createProduct(data: CreatePosProductDto): Promise<PosProduct> {
    const response = await fetch(`${API_BASE_URL}/pos/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create POS product: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a POS product
   */
  static async updateProduct(id: string, data: UpdatePosProductDto): Promise<PosProduct> {
    const response = await fetch(`${API_BASE_URL}/pos/product/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update POS product: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a POS product by ID
   */
  static async getProductById(id: string): Promise<PosProduct> {
    const response = await fetch(`${API_BASE_URL}/pos/product/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch POS product: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a new POS customer
   */
  static async createCustomer(data: CreatePosCustomerDto): Promise<PosCustomer> {
    const response = await fetch(`${API_BASE_URL}/pos/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create POS customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a POS customer
   */
  static async updateCustomer(id: string, data: UpdatePosCustomerDto): Promise<PosCustomer> {
    const response = await fetch(`${API_BASE_URL}/pos/customer/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update POS customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a POS customer by ID
   */
  static async getCustomerById(id: string): Promise<PosCustomer> {
    const response = await fetch(`${API_BASE_URL}/pos/customer/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch POS customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a POS inventory adjustment
   */
  static async createInventoryAdjustment(data: PosInventoryAdjustmentDto): Promise<PosInventoryAdjustment> {
    const response = await fetch(`${API_BASE_URL}/pos/inventory-adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create POS inventory adjustment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets the POS sync queue
   */
  static async getSyncQueue(): Promise<PosSyncLog[]> {
    const response = await fetch(`${API_BASE_URL}/pos/sync-queue`);

    if (!response.ok) {
      throw new Error(`Failed to fetch POS sync queue: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Processes the POS sync queue
   */
  static async processSyncQueue(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pos/process-sync`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to process POS sync queue: ${response.statusText}`);
    }
  }

  /**
   * Gets active POS sessions
   */
  static async getActiveSessions(): Promise<PosSession[]> {
    const response = await fetch(`${API_BASE_URL}/pos/sessions/active`);

    if (!response.ok) {
      throw new Error(`Failed to fetch active POS sessions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets POS sync logs
   */
  static async getSyncLogs(): Promise<PosSyncLog[]> {
    const response = await fetch(`${API_BASE_URL}/pos/sync-logs`);

    if (!response.ok) {
      throw new Error(`Failed to fetch POS sync logs: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Registers a new POS device
   */
  static async registerDevice(data: RegisterPosDeviceDto): Promise<PosDevice> {
    const response = await fetch(`${API_BASE_URL}/pos/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to register POS device: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a POS device by ID
   */
  static async getDeviceById(id: string): Promise<PosDevice> {
    const response = await fetch(`${API_BASE_URL}/pos/device/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch POS device: ${response.statusText}`);
    }

    return response.json();
  }
}