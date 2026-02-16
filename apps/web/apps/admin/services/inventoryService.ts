// services/inventoryService.ts
import { 
  InventoryItem, 
  InventoryBatch, 
  InventoryTransaction, 
  InventoryTransfer,
  ExpiryAlert,
  InventoryAudit,
  ReorderPoint
} from '../api/src/modules/inventory/interfaces/inventory.interface';
import { 
  CreateInventoryItemDto, 
  UpdateInventoryItemDto, 
  CreateInventoryBatchDto, 
  UpdateInventoryBatchDto, 
  CreateInventoryTransactionDto,
  CreateInventoryTransferDto,
  UpdateInventoryTransferDto,
  ConductInventoryAuditDto,
  CreateReorderPointDto,
  UpdateReorderPointDto
} from '../api/src/modules/inventory/dto/inventory.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the inventory API
 */
export class InventoryService {
  /**
   * Creates a new inventory item
   */
  static async createInventoryItem(data: CreateInventoryItemDto): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create inventory item: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates an inventory item
   */
  static async updateInventoryItem(id: string, data: UpdateInventoryItemDto): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update inventory item: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets an inventory item by ID
   */
  static async getInventoryItemById(id: string): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory/items/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory item: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets all inventory items
   */
  static async getAllInventoryItems(): Promise<InventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/items`);

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory items: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets low stock items
   */
  static async getLowStockItems(): Promise<InventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/items/low-stock`);

    if (!response.ok) {
      throw new Error(`Failed to fetch low stock items: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a new inventory batch
   */
  static async createInventoryBatch(data: CreateInventoryBatchDto): Promise<InventoryBatch> {
    const response = await fetch(`${API_BASE_URL}/inventory/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create inventory batch: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates an inventory batch
   */
  static async updateInventoryBatch(id: string, data: UpdateInventoryBatchDto): Promise<InventoryBatch> {
    const response = await fetch(`${API_BASE_URL}/inventory/batches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update inventory batch: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets inventory batches by item ID
   */
  static async getInventoryBatchesByItem(inventoryItemId: string): Promise<InventoryBatch[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/batches/item/${inventoryItemId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory batches: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets expiring batches
   */
  static async getExpiringBatches(daysThreshold: number = 30): Promise<InventoryBatch[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/batches/expiring?days=${daysThreshold}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch expiring batches: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates an inventory transaction
   */
  static async createInventoryTransaction(data: CreateInventoryTransactionDto): Promise<InventoryTransaction> {
    const response = await fetch(`${API_BASE_URL}/inventory/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create inventory transaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets inventory transactions by item ID
   */
  static async getInventoryTransactionsByItem(inventoryItemId: string): Promise<InventoryTransaction[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/transactions/item/${inventoryItemId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory transactions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates an inventory transfer
   */
  static async createInventoryTransfer(data: CreateInventoryTransferDto): Promise<InventoryTransfer> {
    const response = await fetch(`${API_BASE_URL}/inventory/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create inventory transfer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates an inventory transfer
   */
  static async updateInventoryTransfer(id: string, data: UpdateInventoryTransferDto): Promise<InventoryTransfer> {
    const response = await fetch(`${API_BASE_URL}/inventory/transfers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update inventory transfer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets inventory transfers by status
   */
  static async getInventoryTransfersByStatus(status: string): Promise<InventoryTransfer[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/transfers/status/${status}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory transfers: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets expiry alerts
   */
  static async getExpiryAlerts(status?: string): Promise<ExpiryAlert[]> {
    const url = status 
      ? `${API_BASE_URL}/inventory/expiry-alerts?status=${status}`
      : `${API_BASE_URL}/inventory/expiry-alerts`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch expiry alerts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Resolves an expiry alert
   */
  static async resolveExpiryAlert(alertId: string, resolvedBy: string): Promise<ExpiryAlert> {
    const response = await fetch(`${API_BASE_URL}/inventory/expiry-alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resolvedBy }),
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve expiry alert: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Conducts an inventory audit
   */
  static async conductInventoryAudit(data: ConductInventoryAuditDto): Promise<InventoryAudit> {
    const response = await fetch(`${API_BASE_URL}/inventory/audits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to conduct inventory audit: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets inventory audits by item ID
   */
  static async getInventoryAuditsByItem(inventoryItemId: string): Promise<InventoryAudit[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/audits/item/${inventoryItemId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory audits: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a reorder point
   */
  static async createReorderPoint(data: CreateReorderPointDto): Promise<ReorderPoint> {
    const response = await fetch(`${API_BASE_URL}/inventory/reorder-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create reorder point: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a reorder point
   */
  static async updateReorderPoint(id: string, data: UpdateReorderPointDto): Promise<ReorderPoint> {
    const response = await fetch(`${API_BASE_URL}/inventory/reorder-points/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update reorder point: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets reorder points
   */
  static async getReorderPoints(status?: string): Promise<ReorderPoint[]> {
    const url = status 
      ? `${API_BASE_URL}/inventory/reorder-points?status=${status}`
      : `${API_BASE_URL}/inventory/reorder-points`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch reorder points: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets low stock reorder points
   */
  static async getLowStockReorderPoints(): Promise<ReorderPoint[]> {
    const response = await fetch(`${API_BASE_URL}/inventory/reorder-points/low-stock`);

    if (!response.ok) {
      throw new Error(`Failed to fetch low stock reorder points: ${response.statusText}`);
    }

    return response.json();
  }
}