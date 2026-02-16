import { Controller, Get, Post, Put, Body, Query, Req } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { 
  ZohoAuthDto, 
  ZohoRefreshTokenDto, 
  SyncEntityDto,
  ZohoConfigDto,
  SyncAllEntitiesDto 
} from './dto/zoho.dto';
import { ZohoConnection, ZohoSyncLog } from './interfaces/zoho.interface';

@Controller('zoho')
export class ZohoController {
  constructor(private readonly zohoService: ZohoService) {}

  @Post('auth')
  authenticate(@Body() authDto: ZohoAuthDto): Promise<ZohoConnection> {
    return this.zohoService.authenticate(authDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: ZohoRefreshTokenDto): Promise<ZohoConnection> {
    return this.zohoService.refreshToken(refreshTokenDto);
  }

  @Post('sync-entity')
  syncEntity(@Body() syncEntityDto: SyncEntityDto): Promise<ZohoSyncLog> {
    return this.zohoService.syncEntity(syncEntityDto);
  }

  @Post('sync-all')
  syncAllEntities(@Body() syncAllDto: SyncAllEntitiesDto): Promise<ZohoSyncLog[]> {
    return this.zohoService.syncAllEntities(syncAllDto);
  }

  @Get('connection-status')
  getConnectionStatus(): Promise<{ isConnected: boolean; connection?: ZohoConnection }> {
    return this.zohoService.getConnectionStatus();
  }

  @Get('sync-logs')
  getSyncLogs(): Promise<ZohoSyncLog[]> {
    return this.zohoService.getSyncLogs();
  }

  @Post('configure')
  configure(@Body() configDto: ZohoConfigDto): Promise<void> {
    return this.zohoService.configure(configDto);
  }
}