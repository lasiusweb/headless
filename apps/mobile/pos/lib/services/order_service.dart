import 'dart:convert';
import 'package:get_it/get_it.dart';

import '../models/order.dart';
import '../models/order_item.dart';
import 'database_service.dart';
import 'api_service.dart';

class OrderService {
  final DatabaseService _dbService = GetIt.instance.get<DatabaseService>();
  final ApiService _apiService = GetIt.instance.get<ApiService>();

  // Create a new order in local database
  Future<String> createOrder(Order order) async {
    final db = await _dbService.database;
    
    // Insert order
    final orderId = await db.insert('orders', {
      'id': order.id,
      'order_number': order.orderNumber,
      'customer_name': order.customerName,
      'customer_phone': order.customerPhone,
      'total_amount': order.totalAmount,
      'status': order.status,
      'created_at': order.createdAt.toIso8601String(),
      'updated_at': order.updatedAt.toIso8601String(),
    });

    // Insert order items
    for (var item in order.items) {
      await db.insert('order_items', {
        'id': item.id,
        'order_id': order.id,
        'product_id': item.productId,
        'quantity': item.quantity,
        'unit_price': item.unitPrice,
        'total_price': item.totalPrice,
      });
    }

    return order.id;
  }

  // Get all pending orders
  Future<List<Order>> getPendingOrders() async {
    final db = await _dbService.database;
    final orderMaps = await db.query(
      'orders',
      where: 'status = ?',
      whereArgs: ['pending'],
    );

    final orders = <Order>[];

    for (var orderMap in orderMaps) {
      final order = Order.fromJson(orderMap);
      
      // Get order items
      final itemMaps = await db.query(
        'order_items',
        where: 'order_id = ?',
        whereArgs: [order.id],
      );
      
      order.items = itemMaps.map((itemMap) => OrderItem.fromJson(itemMap)).toList();
      orders.add(order);
    }

    return orders;
  }

  // Get order by ID
  Future<Order?> getOrderById(String orderId) async {
    final db = await _dbService.database;
    final orderMaps = await db.query(
      'orders',
      where: 'id = ?',
      whereArgs: [orderId],
    );

    if (orderMaps.isEmpty) {
      return null;
    }

    final order = Order.fromJson(orderMaps.first);
    
    // Get order items
    final itemMaps = await db.query(
      'order_items',
      where: 'order_id = ?',
      whereArgs: [orderId],
    );
    
    order.items = itemMaps.map((itemMap) => OrderItem.fromJson(itemMap)).toList();
    
    return order;
  }

  // Sync pending orders to server
  Future<void> syncPendingOrders() async {
    final pendingOrders = await getPendingOrders();
    
    for (var order in pendingOrders) {
      try {
        // Send order to server
        final response = await _apiService.post('orders', {
          'items': order.items.map((item) => {
            'variantId': item.productId,
            'quantity': item.quantity,
          }).toList(),
          'shippingAddressId': '', // Would need to be implemented
          'notes': 'Order from POS app',
        });

        // Update order status to synced
        final db = await _dbService.database;
        await db.update(
          'orders',
          {'status': 'synced'},
          'id',
          order.id,
        );

        print('Successfully synced order: ${order.orderNumber}');
      } catch (e) {
        print('Failed to sync order ${order.orderNumber}: $e');
        
        // Update order status to failed
        final db = await _dbService.database;
        await db.update(
          'orders',
          {'status': 'failed'},
          'id',
          order.id,
        );
      }
    }
  }

  // Update order status
  Future<void> updateOrderStatus(String orderId, String status) async {
    final db = await _dbService.database;
    await db.update(
      'orders',
      {'status': status},
      'id',
      orderId,
    );
  }
}