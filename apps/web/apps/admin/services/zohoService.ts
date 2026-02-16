// services/zohoService.ts
import { ZohoConnection, ZohoSyncLog } from '../api/src/modules/zoho/interfaces/zoho.interface';
import { 
  ZohoAuthDto, 
  ZohoRefreshTokenDto, 
  SyncEntityDto,
  ZohoConfigDto,
  SyncAllEntitiesDto 
} from '../api/src/modules/zoho/dto/zoho.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the Zoho API
 */
export class ZohoService {
  /**
   * Authenticates with Zoho
   */
  static async authenticate(authDto: ZohoAuthDto): Promise<ZohoConnection> {
    const response = await fetch(`${API_BASE_URL}/zoho/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authDto),
    });

    if (!response.ok) {
      throw new Error(`Failed to authenticate with Zoho: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refreshes the Zoho access token
   */
  static async refreshToken(refreshTokenDto: ZohoRefreshTokenDto): Promise<ZohoConnection> {
    const response = await fetch(`${API_BASE_URL}/zoho/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refreshTokenDto),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh Zoho token: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Syncs a single entity with Zoho
   */
  static async syncEntity(syncEntityDto: SyncEntityDto): Promise<ZohoSyncLog> {
    const response = await fetch(`${API_BASE_URL}/zoho/sync-entity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncEntityDto),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync entity with Zoho: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Syncs all entities of a specific type with Zoho
   */
  static async syncAllEntities(syncAllDto: SyncAllEntitiesDto): Promise<ZohoSyncLog[]> {
    const response = await fetch(`${API_BASE_URL}/zoho/sync-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncAllDto),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync all entities with Zoho: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets the current connection status
   */
  static async getConnectionStatus(): Promise<{ isConnected: boolean; connection?: ZohoConnection }> {
    const response = await fetch(`${API_BASE_URL}/zoho/connection-status`);

    if (!response.ok) {
      throw new Error(`Failed to get connection status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets sync logs
   */
  static async getSyncLogs(): Promise<ZohoSyncLog[]> {
    const response = await fetch(`${API_BASE_URL}/zoho/sync-logs`);

    if (!response.ok) {
      throw new Error(`Failed to get sync logs: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Configures Zoho settings
   */
  static async configure(configDto: ZohoConfigDto): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/zoho/configure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configDto),
    });

    if (!response.ok) {
      throw new Error(`Failed to configure Zoho: ${response.statusText}`);
    }
  }
}