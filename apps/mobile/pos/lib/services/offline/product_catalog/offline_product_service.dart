import 'package:sqflite/sqflite.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class OfflineProductCatalogService {
  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = await getDatabasesPath();
    return await openDatabase(
      '$path/offline_products.db',
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
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        segment_id TEXT,
        category_id TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Create product variants table
    await db.execute('''
      CREATE TABLE product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        name TEXT,
        barcode TEXT,
        mrp REAL NOT NULL,
        dealer_price REAL NOT NULL,
        distributor_price REAL NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    ''');

    // Create categories table
    await db.execute('''
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        parent_id TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Create segments table
    await db.execute('''
      CREATE TABLE segments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )
    ''');
  }

  // Sync products from server
  Future<void> syncProductsFromServer() async {
    try {
      // In a real implementation, this would fetch from the API
      // For now, we'll simulate with mock data
      final mockProducts = await _fetchMockProducts();
      
      final db = await database;
      await db.transaction((txn) async {
        // Clear existing products
        await txn.delete('products');
        await txn.delete('product_variants');
        
        // Insert new products
        for (final product in mockProducts) {
          await txn.insert('products', product['product']);
          
          // Insert variants for this product
          for (final variant in product['variants']) {
            await txn.insert('product_variants', variant);
          }
        }
      });
    } catch (e) {
      print('Error syncing products: $e');
      rethrow;
    }
  }

  // Fetch mock products for demonstration
  Future<List<Map<String, dynamic>>> _fetchMockProducts() async {
    // In a real implementation, this would call the API
    // For now, returning mock data
    return [
      {
        'product': {
          'id': 'prod-1',
          'name': 'Organic Neem Cake Fertilizer',
          'slug': 'organic-neem-cake-fertilizer',
          'description': 'High-quality organic neem cake fertilizer for all crops',
          'segment_id': 'seg-agro',
          'category_id': 'cat-fertilizer',
          'is_active': 1,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        },
        'variants': [
          {
            'id': 'var-1-1',
            'product_id': 'prod-1',
            'sku': 'NEEM-C-500G',
            'name': '500g Pack',
            'barcode': '1234567890123',
            'mrp': 299.00,
            'dealer_price': 179.40, // 40% off for dealers
            'distributor_price': 164.45, // 45% off for distributors
            'is_active': 1,
            'created_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          },
          {
            'id': 'var-1-2',
            'product_id': 'prod-1',
            'sku': 'NEEM-C-1KG',
            'name': '1kg Pack',
            'barcode': '1234567890124',
            'mrp': 549.00,
            'dealer_price': 329.40,
            'distributor_price': 301.95,
            'is_active': 1,
            'created_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          }
        ]
      },
      {
        'product': {
          'id': 'prod-2',
          'name': 'Bio-Zyme Growth Enhancer',
          'slug': 'bio-zyme-growth-enhancer',
          'description': 'Natural growth enhancer for improved crop yield',
          'segment_id': 'seg-agro',
          'category_id': 'cat-bio',
          'is_active': 1,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        },
        'variants': [
          {
            'id': 'var-2-1',
            'product_id': 'prod-2',
            'sku': 'BIO-Z-250ML',
            'name': '250ml Bottle',
            'barcode': '1234567890125',
            'mrp': 499.00,
            'dealer_price': 299.40,
            'distributor_price': 274.45,
            'is_active': 1,
            'created_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          }
        ]
      }
    ];
  }

  // Get all products
  Future<List<Map<String, dynamic>>> getAllProducts() async {
    final db = await database;
    final products = await db.query('products');
    
    // For each product, get its variants
    for (int i = 0; i < products.length; i++) {
      final variants = await db.query(
        'product_variants',
        where: 'product_id = ?',
        whereArgs: [products[i]['id']],
      );
      products[i]['variants'] = variants;
    }
    
    return products;
  }

  // Get product by barcode
  Future<Map<String, dynamic>?> getProductByBarcode(String barcode) async {
    final db = await database;
    final variants = await db.query(
      'product_variants',
      where: 'barcode = ?',
      whereArgs: [barcode],
    );

    if (variants.isEmpty) return null;

    final variant = variants.first;
    final product = await db.query(
      'products',
      where: 'id = ?',
      whereArgs: [variant['product_id']],
      limit: 1,
    );

    if (product.isEmpty) return null;

    return {
      'product': product.first,
      'variant': variant,
    };
  }

  // Get product by ID
  Future<Map<String, dynamic>?> getProductById(String productId) async {
    final db = await database;
    final product = await db.query(
      'products',
      where: 'id = ?',
      whereArgs: [productId],
      limit: 1,
    );

    if (product.isEmpty) return null;

    final variants = await db.query(
      'product_variants',
      where: 'product_id = ?',
      whereArgs: [productId],
    );

    return {
      'product': product.first,
      'variants': variants,
    };
  }

  // Search products by name
  Future<List<Map<String, dynamic>>> searchProducts(String query) async {
    final db = await database;
    final products = await db.query(
      'products',
      where: 'name LIKE ? OR slug LIKE ?',
      whereArgs: ['%$query%', '%$query%'],
    );

    // For each product, get its variants
    for (int i = 0; i < products.length; i++) {
      final variants = await db.query(
        'product_variants',
        where: 'product_id = ?',
        whereArgs: [products[i]['id']],
      );
      products[i]['variants'] = variants;
    }

    return products;
  }

  // Get products by category
  Future<List<Map<String, dynamic>>> getProductsByCategory(String categoryId) async {
    final db = await database;
    final products = await db.query(
      'products',
      where: 'category_id = ?',
      whereArgs: [categoryId],
    );

    // For each product, get its variants
    for (int i = 0; i < products.length; i++) {
      final variants = await db.query(
        'product_variants',
        where: 'product_id = ?',
        whereArgs: [products[i]['id']],
      );
      products[i]['variants'] = variants;
    }

    return products;
  }

  // Get products by segment
  Future<List<Map<String, dynamic>>> getProductsBySegment(String segmentId) async {
    final db = await database;
    final products = await db.query(
      'products',
      where: 'segment_id = ?',
      whereArgs: [segmentId],
    );

    // For each product, get its variants
    for (int i = 0; i < products.length; i++) {
      final variants = await db.query(
        'product_variants',
        where: 'product_id = ?',
        whereArgs: [products[i]['id']],
      );
      products[i]['variants'] = variants;
    }

    return products;
  }

  // Get all categories
  Future<List<Map<String, dynamic>>> getCategories() async {
    final db = await database;
    return await db.query('categories');
  }

  // Get all segments
  Future<List<Map<String, dynamic>>> getSegments() async {
    final db = await database;
    return await db.query('segments');
  }

  // Update local inventory
  Future<void> updateLocalInventory(String variantId, int quantityChange) async {
    final db = await database;
    
    // Get current inventory record
    final records = await db.query(
      'inventory',
      where: 'variant_id = ?',
      whereArgs: [variantId],
    );

    if (records.isNotEmpty) {
      // Update existing inventory
      await db.update(
        'inventory',
        {
          'stock_level': records.first['stock_level'] + quantityChange,
          'updated_at': DateTime.now().toIso8601String(),
        },
        where: 'variant_id = ?',
        whereArgs: [variantId],
      );
    } else {
      // Create new inventory record
      await db.insert(
        'inventory',
        {
          'id': 'inv-${variantId}-${DateTime.now().millisecondsSinceEpoch}',
          'variant_id': variantId,
          'stock_level': quantityChange,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        },
      );
    }
  }

  // Get inventory for a variant
  Future<int> getInventoryForVariant(String variantId) async {
    final db = await database;
    final records = await db.query(
      'inventory',
      where: 'variant_id = ?',
      whereArgs: [variantId],
      limit: 1,
    );

    if (records.isNotEmpty) {
      return records.first['stock_level'] as int;
    }
    
    return 0; // Default to 0 if no inventory record exists
  }
}