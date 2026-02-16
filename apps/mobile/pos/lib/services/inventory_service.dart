import 'dart:convert';
import 'package:get_it/get_it.dart';

import '../models/product.dart';
import '../models/inventory_item.dart';
import 'database_service.dart';
import 'api_service.dart';

class InventoryService {
  final DatabaseService _dbService = GetIt.instance.get<DatabaseService>();
  final ApiService _apiService = GetIt.instance.get<ApiService>();

  // Get all products from local database
  Future<List<Product>> getAllProducts() async {
    final db = await _dbService.database;
    final maps = await db.query('products');
    
    return List.generate(maps.length, (index) {
      return Product.fromJson(maps[index]);
    });
  }

  // Get product by barcode
  Future<Product?> getProductByBarcode(String barcode) async {
    final db = await _dbService.database;
    final maps = await db.query(
      'products',
      where: 'barcode = ?',
      whereArgs: [barcode],
    );
    
    if (maps.isNotEmpty) {
      return Product.fromJson(maps.first);
    }
    
    return null;
  }

  // Get product by ID
  Future<Product?> getProductById(String id) async {
    final db = await _dbService.database;
    final maps = await db.query(
      'products',
      where: 'id = ?',
      whereArgs: [id],
    );
    
    if (maps.isNotEmpty) {
      return Product.fromJson(maps.first);
    }
    
    return null;
  }

  // Sync products from server
  Future<void> syncProductsFromServer() async {
    try {
      final response = await _apiService.get('products');
      final productsData = response['data'] as List;
      
      final db = await _dbService.database;
      await db.transaction((txn) async {
        // Clear existing products
        await txn.delete('products');
        
        // Insert new products
        for (var productData in productsData) {
          await txn.insert('products', {
            'id': productData['id'],
            'name': productData['name'],
            'sku': productData['sku'],
            'barcode': productData['barcode'],
            'mrp': productData['mrp'],
            'dealer_price': productData['dealer_price'],
            'distributor_price': productData['distributor_price'],
            'stock_level': productData['stock_level'] ?? 0,
            'created_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          });
        }
      });
    } catch (e) {
      print('Error syncing products: $e');
      rethrow;
    }
  }

  // Update local inventory
  Future<void> updateLocalInventory(String productId, int quantity) async {
    final db = await _dbService.database;
    
    // Get current inventory
    final maps = await db.query(
      'inventory',
      where: 'product_id = ?',
      whereArgs: [productId],
    );
    
    if (maps.isNotEmpty) {
      // Update existing inventory
      await db.update(
        'inventory',
        {
          'stock_level': maps.first['stock_level'] + quantity,
          'available_quantity': maps.first['available_quantity'] + quantity,
          'updated_at': DateTime.now().toIso8601String(),
        },
        'id',
        maps.first['id'],
      );
    } else {
      // Insert new inventory record
      await db.insert('inventory', {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'product_id': productId,
        'stock_level': quantity,
        'reserved_quantity': 0,
        'available_quantity': quantity,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });
    }
  }

  // Get inventory item by product ID
  Future<InventoryItem?> getInventoryByProductId(String productId) async {
    final db = await _dbService.database;
    final maps = await db.query(
      'inventory',
      where: 'product_id = ?',
      whereArgs: [productId],
    );
    
    if (maps.isNotEmpty) {
      return InventoryItem.fromJson(maps.first);
    }
    
    return null;
  }

  // Get all inventory items
  Future<List<InventoryItem>> getAllInventory() async {
    final db = await _dbService.database;
    final maps = await db.query('inventory');
    
    return List.generate(maps.length, (index) {
      return InventoryItem.fromJson(maps[index]);
    });
  }
}