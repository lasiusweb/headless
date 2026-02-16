class Product {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String segmentId;
  final String categoryId;
  final bool isActive;
  final String? imageUrl;
  final double price;
  final double dealerPrice;
  final double distributorPrice;
  final int stockLevel;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.segmentId,
    required this.categoryId,
    required this.isActive,
    this.imageUrl,
    required this.price,
    required this.dealerPrice,
    required this.distributorPrice,
    required this.stockLevel,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromMap(Map<String, dynamic> map) {
    return Product(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      slug: map['slug'] ?? '',
      description: map['description'] ?? '',
      segmentId: map['segment_id'] ?? '',
      categoryId: map['category_id'] ?? '',
      isActive: map['is_active'] == 1 || map['is_active'] == true,
      imageUrl: map['image_url'],
      price: (map['mrp'] as num?)?.toDouble() ?? 0.0,
      dealerPrice: (map['dealer_price'] as num?)?.toDouble() ?? 0.0,
      distributorPrice: (map['distributor_price'] as num?)?.toDouble() ?? 0.0,
      stockLevel: map['stock_level']?.toInt() ?? 0,
      createdAt: DateTime.parse(map['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(map['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'segment_id': segmentId,
      'category_id': categoryId,
      'is_active': isActive,
      'image_url': imageUrl,
      'mrp': price,
      'dealer_price': dealerPrice,
      'distributor_price': distributorPrice,
      'stock_level': stockLevel,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Product copyWith({
    String? id,
    String? name,
    String? slug,
    String? description,
    String? segmentId,
    String? categoryId,
    bool? isActive,
    String? imageUrl,
    double? price,
    double? dealerPrice,
    double? distributorPrice,
    int? stockLevel,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      segmentId: segmentId ?? this.segmentId,
      categoryId: categoryId ?? this.categoryId,
      isActive: isActive ?? this.isActive,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      dealerPrice: dealerPrice ?? this.dealerPrice,
      distributorPrice: distributorPrice ?? this.distributorPrice,
      stockLevel: stockLevel ?? this.stockLevel,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}