class Order {
  final String id;
  final String orderNumber;
  final String userId;
  final List<OrderItem> items;
  final double subtotal;
  final double taxAmount;
  final double shippingCost;
  final double totalAmount;
  final String status;
  final String paymentStatus;
  final String? shippingAddressId;
  final String? billingAddressId;
  final String currency;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.userId,
    required this.items,
    required this.subtotal,
    required this.taxAmount,
    required this.shippingCost,
    required this.totalAmount,
    required this.status,
    required this.paymentStatus,
    this.shippingAddressId,
    this.billingAddressId,
    required this.currency,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Order.fromMap(Map<String, dynamic> map) {
    return Order(
      id: map['id'] ?? '',
      orderNumber: map['order_number'] ?? '',
      userId: map['user_id'] ?? '',
      items: List<OrderItem>.from(
        (map['items'] as List).map((item) => OrderItem.fromMap(item))
      ),
      subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0.0,
      taxAmount: (map['tax_amount'] as num?)?.toDouble() ?? 0.0,
      shippingCost: (map['shipping_cost'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (map['total_amount'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] ?? 'pending',
      paymentStatus: map['payment_status'] ?? 'pending',
      shippingAddressId: map['shipping_address_id'],
      billingAddressId: map['billing_address_id'],
      currency: map['currency'] ?? 'INR',
      notes: map['notes'],
      createdAt: DateTime.parse(map['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(map['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'order_number': orderNumber,
      'user_id': userId,
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'tax_amount': taxAmount,
      'shipping_cost': shippingCost,
      'total_amount': totalAmount,
      'status': status,
      'payment_status': paymentStatus,
      'shipping_address_id': shippingAddressId,
      'billing_address_id': billingAddressId,
      'currency': currency,
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class OrderItem {
  final String id;
  final String orderId;
  final String variantId;
  final String variantName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItem({
    required this.id,
    required this.orderId,
    required this.variantId,
    required this.variantName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      id: map['id'] ?? '',
      orderId: map['order_id'] ?? '',
      variantId: map['variant_id'] ?? '',
      variantName: map['variant_name'] ?? '',
      quantity: map['quantity']?.toInt() ?? 0,
      unitPrice: (map['unit_price'] as num?)?.toDouble() ?? 0.0,
      totalPrice: (map['total_price'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'order_id': orderId,
      'variant_id': variantId,
      'variant_name': variantName,
      'quantity': quantity,
      'unit_price': unitPrice,
      'total_price': totalPrice,
    };
  }
}