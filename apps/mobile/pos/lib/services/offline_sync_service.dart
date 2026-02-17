import 'dart:async';
import 'dart:convert';
import 'package:logger/logger.dart';
import 'package:workmanager/workmanager.dart';
import 'database_service.dart';
import '../utils/constants.dart';

class OfflineSyncService {
  static final OfflineSyncService _instance = OfflineSyncService._internal();
  factory OfflineSyncService() => _instance;
  OfflineSyncService._internal();

  final DatabaseService _databaseService = DatabaseService();
  final Logger _logger = Logger();
  bool _isSyncing = false;
  Timer? _syncTimer;

  /// Initialize background sync
  Future<void> initialize() async {
    // Initialize WorkManager for background sync
    await Workmanager().initialize(
      callbackDispatcher,
      isInDebugMode: true,
    );

    // Register periodic sync task (every 15 minutes minimum on Android)
    await Workmanager().registerPeriodicTask(
      'com.knbiosciences.pos.sync',
      'syncData',
      frequency: const Duration(minutes: 15),
      constraints: Workmanager.Constraints(
        networkType: NetworkType.connected,
        requiresBatteryNotLow: false,
      ),
    );

    _logger.i('Offline sync service initialized');
  }

  /// Add item to sync queue
  Future<void> addToSyncQueue({
    required String entityType,
    required String entityId,
    required String operation,
    required Map<String, dynamic> data,
  }) async {
    final db = await _databaseService.database;
    
    await db.insert(
      'sync_queue',
      {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'entity_type': entityType,
        'entity_id': entityId,
        'operation': operation,
        'data': jsonEncode(data),
        'status': 'pending',
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    _logger.d('Added to sync queue: $entityType - $entityId - $operation');
    
    // Trigger immediate sync if online
    if (await _isOnline()) {
      _triggerSync();
    }
  }

  /// Process sync queue
  Future<SyncResult> processSyncQueue() async {
    if (_isSyncing) {
      _logger.w('Sync already in progress');
      return SyncResult(success: false, message: 'Sync already in progress');
    }

    _isSyncing = true;
    final db = await _databaseService.database;
    
    try {
      // Get all pending sync items
      final pendingItems = await db.query(
        'sync_queue',
        where: 'status = ?',
        whereArgs: ['pending'],
        orderBy: 'created_at ASC',
      );

      _logger.i('Processing ${pendingItems.length} sync items');

      if (pendingItems.isEmpty) {
        return SyncResult(success: true, message: 'Nothing to sync');
      }

      int successCount = 0;
      int failedCount = 0;

      for (final item in pendingItems) {
        try {
          final result = await _syncItem(item);
          if (result) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch (e) {
          _logger.e('Error syncing item ${item['id']}: $e');
          failedCount++;
          await _markAsFailed(item['id'] as String, e.toString());
        }
      }

      _logger.i('Sync completed: $successCount success, $failedCount failed');
      
      return SyncResult(
        success: failedCount == 0,
        message: 'Synced $successCount items, $failedCount failed',
        syncedCount: successCount,
        failedCount: failedCount,
      );
    } finally {
      _isSyncing = false;
    }
  }

  /// Sync individual item to server
  Future<bool> _syncItem(Map<String, dynamic> item) async {
    final entityType = item['entity_type'] as String;
    const entityId = '';
    final operation = item['operation'] as String;
    final data = jsonDecode(item['data'] as String) as Map<String, dynamic>;

    // TODO: Implement actual API calls to backend
    // For now, simulate sync
    await Future.delayed(const Duration(milliseconds: 500));

    // Mark as synced
    await _markAsSynced(item['id'] as String);
    return true;
  }

  /// Mark item as synced
  Future<void> _markAsSynced(String id) async {
    final db = await _databaseService.database;
    await db.update(
      'sync_queue',
      {
        'status': 'synced',
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Mark item as failed
  Future<void> _markAsFailed(String id, String error) async {
    final db = await _databaseService.database;
    await db.update(
      'sync_queue',
      {
        'status': 'failed',
        'updated_at': DateTime.now().toIso8601String(),
        'error_message': error,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Check if device is online
  Future<bool> _isOnline() async {
    // TODO: Implement actual connectivity check
    return true;
  }

  /// Trigger immediate sync
  void _triggerSync() {
    if (!_isSyncing) {
      processSyncQueue();
    }
  }

  /// Get sync status
  Future<SyncStatus> getSyncStatus() async {
    final db = await _databaseService.database;
    
    final pendingCount = await db.rawQuery(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'",
    );
    
    final failedCount = await db.rawQuery(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'failed'",
    );

    final lastSyncResult = await db.rawQuery(
      "SELECT * FROM sync_queue WHERE status IN ('synced', 'failed') ORDER BY updated_at DESC LIMIT 1",
    );

    return SyncStatus(
      pendingItems: pendingCount.first['count'] as int? ?? 0,
      failedItems: failedCount.first['count'] as int? ?? 0,
      lastSyncTime: lastSyncResult.isNotEmpty 
          ? DateTime.parse(lastSyncResult.first['updated_at'] as String)
          : null,
      isSyncing: _isSyncing,
    );
  }

  /// Retry failed sync items
  Future<void> retryFailedSync() async {
    final db = await _databaseService.database;
    await db.update(
      'sync_queue',
      {
        'status': 'pending',
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'status = ?',
      whereArgs: ['failed'],
    );

    _triggerSync();
  }

  /// Clear old synced items (older than 30 days)
  Future<void> clearOldSyncedItems() async {
    final db = await _databaseService.database;
    final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));
    
    await db.delete(
      'sync_queue',
      where: 'status = ? AND updated_at < ?',
      whereArgs: ['synced', thirtyDaysAgo.toIso8601String()],
    );
  }

  /// Dispose
  void dispose() {
    _syncTimer?.cancel();
    Workmanager().cancelAll();
  }
}

/// Sync result class
class SyncResult {
  final bool success;
  final String message;
  final int? syncedCount;
  final int? failedCount;

  SyncResult({
    required this.success,
    required this.message,
    this.syncedCount,
    this.failedCount,
  });
}

/// Sync status class
class SyncStatus {
  final int pendingItems;
  final int failedItems;
  final DateTime? lastSyncTime;
  final bool isSyncing;

  SyncStatus({
    required this.pendingItems,
    required this.failedItems,
    this.lastSyncTime,
    required this.isSyncing,
  });
}

/// Workmanager callback dispatcher
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case 'syncData':
        await OfflineSyncService().processSyncQueue();
        break;
      default:
        break;
    }
    return Future.value(true);
  });
}
