import 'package:sqflite/sqflite.dart';
import 'dart:convert';

class OfflineCartService {
  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = await getDatabasesPath();
    return await openDatabase(
      '$path/offline_cart.db',
      version: 1,
      onCreate: _createTables,
    );
  }

  Future<void> _createTables(Database db, int version) async {
    // Create cart table
    await db.execute('''
      CREATE TABLE cart (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        session_id TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Create cart items table
    await db.execute('''
      CREATE TABLE cart_items (
        id TEXT PRIMARY KEY,
        cart_id TEXT NOT NULL,
        variant_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (cart_id) REFERENCES cart (id) ON DELETE CASCADE
      )
    ''');
  }

  // Get or create cart for user/session
  Future<String> getOrCreateCart({String? userId, String? sessionId}) async {
    final db = await database;
    
    // Try to find existing cart for user
    if (userId != null) {
      final existingCarts = await db.query(
        'cart',
        where: 'user_id = ?',
        whereArgs: [userId],
        limit: 1,
      );
      
      if (existingCarts.isNotEmpty) {
        return existingCarts.first['id'];
      }
    }
    
    // Try to find existing cart for session
    if (sessionId != null) {
      final existingCarts = await db.query(
        'cart',
        where: 'session_id = ?',
        whereArgs: [sessionId],
        limit: 1,
      );
      
      if (existingCarts.isNotEmpty) {
        return existingCarts.first['id'];
      }
    }
    
    // Create new cart
    final cartId = 'cart-${DateTime.now().millisecondsSinceEpoch}';
    await db.insert(
      'cart',
      {
        'id': cartId,
        'user_id': userId,
        'session_id': sessionId,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      },
    );
    
    return cartId;
  }

  // Add item to cart
  Future<void> addItemToCart(String cartId, String variantId, int quantity, double unitPrice) async {
    final db = await database;
    
    // Check if item already exists in cart
    final existingItems = await db.query(
      'cart_items',
      where: 'cart_id = ? AND variant_id = ?',
      whereArgs: [cartId, variantId],
    );
    
    if (existingItems.isNotEmpty) {
      // Update existing item quantity
      final existingQuantity = existingItems.first['quantity'] as int;
      final newQuantity = existingQuantity + quantity;
      final newTotalPrice = newQuantity * unitPrice;
      
      await db.update(
        'cart_items',
        {
          'quantity': newQuantity,
          'total_price': newTotalPrice,
          'updated_at': DateTime.now().toIso8601String(),
        },
        where: 'id = ?',
        whereArgs: [existingItems.first['id']],
      );
    } else {
      // Add new item to cart
      await db.insert(
        'cart_items',
        {
          'id': 'cart-item-${DateTime.now().millisecondsSinceEpoch}',
          'cart_id': cartId,
          'variant_id': variantId,
          'quantity': quantity,
          'unit_price': unitPrice,
          'total_price': quantity * unitPrice,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        },
      );
    }
    
    // Update cart timestamp
    await db.update(
      'cart',
      {'updated_at': DateTime.now().toIso8601String()},
      where: 'id = ?',
      whereArgs: [cartId],
    );
  }

  // Update item quantity in cart
  Future<void> updateItemQuantity(String cartItemId, int newQuantity) async {
    final db = await database;
    
    if (newQuantity <= 0) {
      await removeItemFromCart(cartItemId);
      return;
    }
    
    // Get the item to calculate new total
    final items = await db.query(
      'cart_items',
      where: 'id = ?',
      whereArgs: [cartItemId],
      limit: 1,
    );
    
    if (items.isEmpty) return;
    
    final item = items.first;
    final unitPrice = item['unit_price'] as double;
    final newTotalPrice = newQuantity * unitPrice;
    
    await db.update(
      'cart_items',
      {
        'quantity': newQuantity,
        'total_price': newTotalPrice,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [cartItemId],
    );
  }

  // Remove item from cart
  Future<void> removeItemFromCart(String cartItemId) async {
    final db = await database;
    await db.delete(
      'cart_items',
      where: 'id = ?',
      whereArgs: [cartItemId],
    );
  }

  // Clear cart
  Future<void> clearCart(String cartId) async {
    final db = await database;
    await db.delete(
      'cart_items',
      where: 'cart_id = ?',
      whereArgs: [cartId],
    );
  }

  // Get cart items
  Future<List<Map<String, dynamic>>> getCartItems(String cartId) async {
    final db = await database;
    final items = await db.query(
      'cart_items',
      where: 'cart_id = ?',
      whereArgs: [cartId],
    );
    
    // Get product details for each item
    for (int i = 0; i < items.length; i++) {
      // In a real implementation, we'd join with product tables
      // For now, we'll add placeholder product data
      items[i]['product'] = {
        'name': 'Product Name', // This would come from the product catalog
        'sku': 'SKU-${items[i]['variant_id']}',
      };
    }
    
    return items;
  }

  // Get cart total
  Future<double> getCartTotal(String cartId) async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT SUM(total_price) as total FROM cart_items WHERE cart_id = ?',
      [cartId],
    );
    
    final total = result.first['total'];
    return total == null ? 0.0 : total.toDouble();
  }

  // Get cart summary
  Future<Map<String, dynamic>> getCartSummary(String cartId) async {
    final items = await getCartItems(cartId);
    final total = await getCartTotal(cartId);
    
    int totalItems = 0;
    for (final item in items) {
      totalItems += item['quantity'];
    }
    
    return {
      'id': cartId,
      'items': items,
      'itemCount': totalItems,
      'total': total,
    };
  }

  // Convert cart to order format for sync
  Future<Map<String, dynamic>> convertCartToOrder(String cartId, String userId) async {
    final cartItems = await getCartItems(cartId);
    final cartTotal = await getCartTotal(cartId);
    
    // Prepare order data
    final orderData = {
      'id': 'order-${DateTime.now().millisecondsSinceEpoch}',
      'user_id': userId,
      'items': cartItems.map((item) => ({
        'variant_id': item['variant_id'],
        'quantity': item['quantity'],
        'unit_price': item['unit_price'],
        'total_price': item['total_price'],
      })).toList(),
      'subtotal': cartTotal,
      'tax_amount': cartTotal * 0.18, // Assuming 18% GST
      'shipping_cost': 0.0, // Could be calculated based on location
      'total_amount': cartTotal * 1.18, // Including GST
      'status': 'pending',
      'payment_status': 'pending',
      'created_at': DateTime.now().toIso8601String(),
    };
    
    return orderData;
  }

  // Create order from cart
  Future<Map<String, dynamic>> createOrderFromCart(String cartId, String userId) async {
    final orderData = await convertCartToOrder(cartId, userId);
    
    // Clear the cart after creating the order
    await clearCart(cartId);
    
    return orderData;
  }
}