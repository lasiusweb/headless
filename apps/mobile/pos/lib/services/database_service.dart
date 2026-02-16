import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseService {
  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'pos_database.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _createTables,
    );
  }

  Future<void> _createTables(Database db, int version) async {
    // Create products table
    await db.execute('''
      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT,
        mrp REAL NOT NULL,
        dealer_price REAL NOT NULL,
        distributor_price REAL NOT NULL,
        stock_level INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Create orders table
    await db.execute('''
      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, synced, failed
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Create order_items table
    await db.execute('''
      CREATE TABLE order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )
    ''');

    // Create sync_queue table to track items needing sync
    await db.execute('''
      CREATE TABLE sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL, -- 'order', 'inventory', etc.
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL, -- 'create', 'update', 'delete'
        data TEXT NOT NULL, -- JSON string of the entity data
        status TEXT DEFAULT 'pending', -- pending, syncing, synced, failed
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Create inventory table
    await db.execute('''
      CREATE TABLE inventory (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        warehouse_id TEXT,
        stock_level INTEGER DEFAULT 0,
        reserved_quantity INTEGER DEFAULT 0,
        available_quantity INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    ''');
  }

  // Generic insert method
  Future<int> insert(String table, Map<String, dynamic> row) async {
    Database db = await database;
    return await db.insert(table, row, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // Generic update method
  Future<int> update(String table, Map<String, dynamic> row, String? column, Object? value) async {
    Database db = await database;
    return await db.update(table, row, where: '$column = ?', whereArgs: [value]);
  }

  // Generic delete method
  Future<int> delete(String table, String? column, Object? value) async {
    Database db = await database;
    return await db.delete(table, where: '$column = ?', whereArgs: [value]);
  }

  // Generic query method
  Future<List<Map<String, dynamic>>> query(String table, {String? where, List<Object?>? whereArgs}) async {
    Database db = await database;
    return await db.query(table, where: where, whereArgs: whereArgs);
  }
}