import 'package:sqflite/sqflite.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class OfflineSyncService {
  static final OfflineSyncService _instance = OfflineSyncService._internal();
  factory OfflineSyncService() => _instance;
  OfflineSyncService._internal();

  Database? _database;
  static const String _dbName = 'pos_offline.db';

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = await getDatabasesPath();
    return await openDatabase(
      '$path/$_dbName',
      version: 1,
      onCreate: _createTables,
    );
  }

  Future<void> _createTables(Database db, int version) async {
    // Create offline orders table
    await db.execute('''
      CREATE TABLE offline_orders (
        id TEXT PRIMARY KEY,
        order_data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        synced_at TEXT
      )
    ''');

    // Create offline inventory table
    await db.execute('''
      CREATE TABLE offline_inventory (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        variant_id TEXT NOT NULL,
        stock_level INTEGER NOT NULL,
        last_updated TEXT
      )
    ''');

    // Create sync queue table
    await db.execute('''
      CREATE TABLE sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        synced_at TEXT
      )
    ''');
  }

  // Add an order to offline storage
  Future<void> addOfflineOrder(Map<String, dynamic> orderData) async {
    final db = await database;
    await db.insert(
      'offline_orders',
      {
        'id': orderData['id'],
        'order_data': json.encode(orderData),
        'status': 'pending',
        'created_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Get all pending offline orders
  Future<List<Map<String, dynamic>>> getPendingOrders() async {
    final db = await database;
    final maps = await db.query(
      'offline_orders',
      where: 'status = ?',
      whereArgs: ['pending'],
    );

    return maps.map((map) {
      map['order_data'] = json.decode(map['order_data']);
      return map;
    }).toList();
  }

  // Add inventory change to offline storage
  Future<void> addOfflineInventoryChange(String productId, String variantId, int newStockLevel) async {
    final db = await database;
    await db.insert(
      'offline_inventory',
      {
        'id': '$productId-$variantId-${DateTime.now().millisecondsSinceEpoch}',
        'product_id': productId,
        'variant_id': variantId,
        'stock_level': newStockLevel,
        'last_updated': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Add to sync queue
  Future<void> addToSyncQueue(String entityType, String entityId, String operation, Map<String, dynamic> data) async {
    final db = await database;
    await db.insert(
      'sync_queue',
      {
        'id': '${entityType}_${entityId}_${DateTime.now().millisecondsSinceEpoch}',
        'entity_type': entityType,
        'entity_id': entityId,
        'operation': operation,
        'data': json.encode(data),
        'status': 'pending',
        'created_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Get items in sync queue
  Future<List<Map<String, dynamic>>> getSyncQueue() async {
    final db = await database;
    final maps = await db.query(
      'sync_queue',
      where: 'status = ?',
      whereArgs: ['pending'],
      orderBy: 'created_at ASC',
    );

    return maps.map((map) {
      map['data'] = json.decode(map['data']);
      return map;
    }).toList();
  }

  // Update sync status
  Future<void> updateSyncStatus(String id, String status) async {
    final db = await database;
    await db.update(
      'sync_queue',
      {'status': status, 'synced_at': DateTime.now().toIso8601String()},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Sync pending items to server
  Future<void> syncToServer() async {
    final queueItems = await getSyncQueue();
    
    for (final item in queueItems) {
      try {
        final response = await http.post(
          Uri.parse('${getApiBaseUrl()}/${item['entity_type']}'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${await getAuthToken()}',
          },
          body: json.encode(item['data']),
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          await updateSyncStatus(item['id'], 'synced');
          print('Successfully synced ${item['entity_type']} ${item['entity_id']}');
        } else {
          print('Failed to sync ${item['entity_type']} ${item['entity_id']}: ${response.body}');
          await updateSyncStatus(item['id'], 'failed');
        }
      } catch (e) {
        print('Error syncing ${item['entity_type']} ${item['entity_id']}: $e');
        await updateSyncStatus(item['id'], 'failed');
      }
    }
  }

  // Helper methods
  String getApiBaseUrl() {
    // In a real implementation, this would come from configuration
    return 'https://api.knbiosciences.in';
  }

  Future<String?> getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Check network connectivity
  Future<bool> isOnline() async {
    try {
      final result = await http.get(Uri.parse('https://httpbin.org/get'));
      return result.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Initialize offline capabilities
  Future<void> initialize() async {
    await database;
    print('Offline sync service initialized');
  }
}