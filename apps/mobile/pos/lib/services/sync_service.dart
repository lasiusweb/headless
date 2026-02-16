import 'dart:async';
import 'package:get_it/get_it.dart';
import 'package:workmanager/workmanager.dart';

import 'database_service.dart';
import 'api_service.dart';

class SyncService {
  final DatabaseService _dbService = GetIt.instance.get<DatabaseService>();
  final ApiService _apiService = GetIt.instance.get<ApiService>();

  static const String syncTag = "sync_tag";

  Future<void> initializeSync() async {
    await Workmanager().initialize(callbackDispatcher, isInDebugMode: true);
    await scheduleSync();
  }

  Future<void> scheduleSync() async {
    await Workmanager().registerPeriodicTask(
      "unique_task_id",
      syncTag,
      frequency: const Duration(minutes: 15), // Sync every 15 minutes
    );
  }

  Future<void> performSync() async {
    try {
      print('Starting sync process...');
      
      // Sync pending orders to server
      await _syncPendingOrders();
      
      // Sync inventory changes to server
      await _syncInventoryChanges();
      
      // Pull latest data from server
      await _pullLatestData();
      
      print('Sync completed successfully');
    } catch (e) {
      print('Sync failed: $e');
    }
  }

  Future<void> _syncPendingOrders() async {
    // This would be implemented to sync orders to the server
    // For now, just a placeholder
    print('Syncing pending orders...');
  }

  Future<void> _syncInventoryChanges() async {
    // This would be implemented to sync inventory changes to the server
    // For now, just a placeholder
    print('Syncing inventory changes...');
  }

  Future<void> _pullLatestData() async {
    // This would be implemented to pull latest products, prices, etc. from server
    // For now, just a placeholder
    print('Pulling latest data from server...');
  }

  Future<void> addToSyncQueue(String entityType, String entityId, String operation, Map<String, dynamic> data) async {
    final db = await _dbService.database;
    
    await db.insert('sync_queue', {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'entity_type': entityType,
      'entity_id': entityId,
      'operation': operation,
      'data': data.toString(), // In real implementation, use jsonEncode
      'status': 'pending',
      'created_at': DateTime.now().toIso8601String(),
      'updated_at': DateTime.now().toIso8601String(),
    });
  }

  Future<void> processSyncQueue() async {
    final db = await _dbService.database;
    final pendingItems = await db.query(
      'sync_queue',
      where: 'status = ?',
      whereArgs: ['pending'],
    );

    for (var item in pendingItems) {
      try {
        final entityType = item['entity_type'];
        final operation = item['operation'];
        final data = item['data'];

        // Process the sync item based on entity type and operation
        switch (entityType) {
          case 'order':
            await _processOrderSync(item['entity_id'], operation, data);
            break;
          case 'inventory':
            await _processInventorySync(item['entity_id'], operation, data);
            break;
          default:
            print('Unknown entity type: $entityType');
        }

        // Update sync queue item status to synced
        await db.update(
          'sync_queue',
          {'status': 'synced'},
          'id',
          item['id'],
        );
      } catch (e) {
        print('Error processing sync queue item: $e');
        
        // Update sync queue item status to failed
        await db.update(
          'sync_queue',
          {'status': 'failed'},
          'id',
          item['id'],
        );
      }
    }
  }

  Future<void> _processOrderSync(String orderId, String operation, String data) async {
    // Process order sync based on operation
    if (operation == 'create') {
      // Send order to server
      await _apiService.post('orders', {});
    } else if (operation == 'update') {
      // Update order on server
      await _apiService.put('orders/$orderId', {});
    }
  }

  Future<void> _processInventorySync(String inventoryId, String operation, String data) async {
    // Process inventory sync based on operation
    if (operation == 'update') {
      // Update inventory on server
      await _apiService.put('inventory/$inventoryId', {});
    }
  }
}

void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    if (task == SyncService.syncTag) {
      // In a real implementation, you would get the SyncService instance and call performSync
      print("Sync task executed");
      return Future.value(true);
    }
    return Future.value(false);
  });
}