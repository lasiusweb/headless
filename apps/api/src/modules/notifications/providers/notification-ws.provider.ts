import { Injectable, Logger } from '@nestjs/common';
import { Server, WebSocketServer } from 'ws';
import { SupabaseService } from '../../../supabase/supabase.service';

@Injectable()
export class NotificationWsProvider {
  private readonly logger = new Logger(NotificationWsProvider.name);
  @WebSocketServer()
  server: Server;

  constructor(private supabaseService: SupabaseService) {}

  async sendNotificationToUser(userId: string, notification: any) {
    // In a real implementation, we would send the notification to the user's WebSocket connection
    // For now, we'll log it
    this.logger.log(`Sending notification to user ${userId}: ${JSON.stringify(notification)}`);
    
    // In a real implementation, we would broadcast to the user's connection
    // this.server.clients.forEach(client => {
    //   if (client['userId'] === userId && client.readyState === WebSocket.OPEN) {
    //     client.send(JSON.stringify(notification));
    //   }
    // });
  }

  async broadcastToAll(notification: any) {
    this.logger.log(`Broadcasting notification to all: ${JSON.stringify(notification)}`);
    
    // In a real implementation, we would broadcast to all connected clients
    // this.server.clients.forEach(client => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(JSON.stringify(notification));
    //   }
    // });
  }

  async broadcastToRole(role: string, notification: any) {
    this.logger.log(`Broadcasting notification to role ${role}: ${JSON.stringify(notification)}`);
    
    // In a real implementation, we would get users with specific role and send to their connections
    // const { data: users, error } = await this.supabaseService.getClient()
    //   .from('profiles')
    //   .select('id')
    //   .eq('role', role);
    //
    // if (!error && users) {
    //   for (const user of users) {
    //     await this.sendNotificationToUser(user.id, notification);
    //   }
    // }
  }
}