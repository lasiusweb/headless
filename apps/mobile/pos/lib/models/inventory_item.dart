class InventoryItem {
  final String id;
  final String productId;
  final String? warehouseId;
  final int stockLevel;
  final int reservedQuantity;
  final int availableQuantity;
  final DateTime createdAt;
  final DateTime updatedAt;

  InventoryItem({
    required this.id,
    required this.productId,
    this.warehouseId,
    required this.stockLevel,
    required this.reservedQuantity,
    required this.availableQuantity,
    required this.createdAt,
    required this.updatedAt,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['id'],
      productId: json['product_id'],
      warehouseId: json['warehouse_id'],
      stockLevel: json['stock_level']?.toInt() ?? 0,
      reservedQuantity: json['reserved_quantity']?.toInt() ?? 0,
      availableQuantity: json['available_quantity']?.toInt() ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'warehouse_id': warehouseId,
      'stock_level': stockLevel,
      'reserved_quantity': reservedQuantity,
      'available_quantity': availableQuantity,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}