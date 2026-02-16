import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:barcode_scan2/barcode_scan2.dart';

import '../../models/cart_item.dart';
import '../../models/product.dart';
import '../../services/offline/offline_sync_service.dart';
import '../../services/offline/product_catalog/offline_product_service.dart';
import '../../services/offline/cart/offline_cart_service.dart';

class POSScreen extends StatefulWidget {
  const POSScreen({Key? key}) : super(key: key);

  @override
  State<POSScreen> createState() => _POSScreenState();
}

class _POSScreenState extends State<POSScreen> {
  final TextEditingController _searchController = TextEditingController();
  final OfflineSyncService _syncService = OfflineSyncService();
  final OfflineProductCatalogService _productService = OfflineProductCatalogService();
  final OfflineCartService _cartService = OfflineCartService();
  
  String _currentCartId = '';
  List<CartItem> _cartItems = [];
  List<Product> _products = [];
  List<Product> _filteredProducts = [];
  bool _isLoading = true;
  bool _isOnline = false;

  @override
  void initState() {
    super.initState();
    _initializePOS();
  }

  Future<void> _initializePOS() async {
    await _syncService.initialize();
    await _loadCart();
    await _loadProducts();
    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _loadCart() async {
    // Get or create a cart for the current session
    _currentCartId = await _cartService.getOrCreateCart(sessionId: 'session-${DateTime.now().millisecondsSinceEpoch}');
    _refreshCart();
  }

  Future<void> _loadProducts() async {
    _products = await _productService.getAllProducts();
    _filteredProducts = _products;
  }

  Future<void> _refreshCart() async {
    final cartItems = await _cartService.getCartItems(_currentCartId);
    setState(() {
      _cartItems = cartItems.map((item) => CartItem.fromMap(item)).toList();
    });
  }

  Future<void> _searchProducts(String query) async {
    if (query.isEmpty) {
      setState(() {
        _filteredProducts = _products;
      });
      return;
    }

    final searchResults = await _productService.searchProducts(query);
    setState(() {
      _filteredProducts = searchResults.map((item) => Product.fromMap(item)).toList();
    });
  }

  Future<void> _scanBarcode() async {
    try {
      final result = await BarcodeScanner.scan();
      if (result.type == ResultType.Barcode) {
        _handleScannedCode(result.code!);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to scan barcode: $e')),
      );
    }
  }

  Future<void> _handleScannedCode(String barcode) async {
    final product = await _productService.getProductByBarcode(barcode);
    if (product != null) {
      // Add product to cart
      await _cartService.addItemToCart(
        _currentCartId,
        product['variant']['id'],
        1, // Default quantity
        product['variant']['dealer_price'].toDouble(), // Use dealer price
      );
      _refreshCart();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Added ${product['product']['name']} to cart')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Product not found for barcode: $barcode')),
      );
    }
  }

  Future<void> _addItemToCart(String variantId, int quantity) async {
    final product = await _productService.getProductById(variantId);
    if (product != null) {
      await _cartService.addItemToCart(
        _currentCartId,
        variantId,
        quantity,
        product['variant']['dealer_price'].toDouble(),
      );
      _refreshCart();
    }
  }

  Future<void> _removeItemFromCart(String itemId) async {
    await _cartService.removeItemFromCart(itemId);
    _refreshCart();
  }

  Future<void> _updateItemQuantity(String itemId, int newQuantity) async {
    await _cartService.updateItemQuantity(itemId, newQuantity);
    _refreshCart();
  }

  Future<void> _processOrder() async {
    if (_cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Cart is empty')),
      );
      return;
    }

    // Calculate order total
    double total = 0;
    for (final item in _cartItems) {
      total += item.totalPrice;
    }

    // Show confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Confirm Order'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Total: ₹${total.toStringAsFixed(2)}'),
            Text('Items: ${_cartItems.length}'),
            SizedBox(height: 10),
            Text('Are you sure you want to place this order?'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        // Create order from cart
        final orderData = await _cartService.convertCartToOrder(_currentCartId, 'current-user-id');
        
        // Add to sync queue
        await _syncService.addToSyncQueue('order', orderData['id'], 'create', orderData);
        
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Order placed successfully!')),
        );
        
        // Refresh cart
        await _loadCart();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error placing order: $e')),
        );
      }
    }
  }

  Future<void> _syncData() async {
    try {
      final isOnline = await _syncService.isOnline();
      if (isOnline) {
        await _syncService.syncToServer();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Data synced successfully')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No internet connection. Data will sync when online.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error syncing data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('KN POS'),
        actions: [
          IconButton(
            icon: Icon(Icons.sync),
            onPressed: _syncData,
            tooltip: 'Sync Data',
          ),
          PopupMenuButton<String>(
            onSelected: (String result) {
              if (result == 'settings') {
                // Navigate to settings
              } else if (result == 'logout') {
                // Handle logout
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                value: 'settings',
                child: Text('Settings'),
              ),
              const PopupMenuItem<String>(
                value: 'logout',
                child: Text('Logout'),
              ),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search and Scan Section
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Search products...',
                            prefixIcon: Icon(Icons.search),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          onChanged: _searchProducts,
                        ),
                      ),
                      SizedBox(width: 8),
                      IconButton(
                        icon: Icon(Icons.camera_alt),
                        onPressed: _scanBarcode,
                        tooltip: 'Scan Barcode',
                      ),
                    ],
                  ),
                ),
                
                // Cart Summary
                Container(
                  padding: EdgeInsets.all(16),
                  margin: EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Cart: ${_cartItems.length} items',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Total: ₹${_cartItems.fold(0, (sum, item) => sum + item.totalPrice).toStringAsFixed(2)}',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: 16),
                
                // Main Content Area
                Expanded(
                  child: Row(
                    children: [
                      // Product List
                      Expanded(
                        flex: 2,
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 8),
                          child: _filteredProducts.isEmpty
                              ? Center(child: Text('No products found'))
                              : ListView.builder(
                                  itemCount: _filteredProducts.length,
                                  itemBuilder: (context, index) {
                                    final product = _filteredProducts[index];
                                    return Card(
                                      child: ListTile(
                                        title: Text(product.name),
                                        subtitle: Text('₹${product.price.toStringAsFixed(2)}'),
                                        trailing: Wrap(
                                          spacing: 12,
                                          children: [
                                            IconButton(
                                              icon: Icon(Icons.add),
                                              onPressed: () => _addItemToCart(product.id, 1),
                                            ),
                                            Text('${product.stockLevel} in stock'),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ),
                      ),
                      
                      SizedBox(width: 16),
                      
                      // Cart Section
                      Expanded(
                        child: Card(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Cart Items',
                                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                    ),
                                    TextButton(
                                      onPressed: () => _cartService.clearCart(_currentCartId),
                                      child: Text('Clear Cart'),
                                    ),
                                  ],
                                ),
                                SizedBox(height: 16),
                                
                                Expanded(
                                  child: _cartItems.isEmpty
                                      ? Center(child: Text('Cart is empty'))
                                      : ListView.builder(
                                          itemCount: _cartItems.length,
                                          itemBuilder: (context, index) {
                                            final item = _cartItems[index];
                                            return Card(
                                              child: Padding(
                                                padding: EdgeInsets.all(8),
                                                child: Row(
                                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                  children: [
                                                    Expanded(
                                                      child: Column(
                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                        children: [
                                                          Text(
                                                            item.productName,
                                                            style: TextStyle(fontWeight: FontWeight.bold),
                                                          ),
                                                          Text('₹${item.unitPrice.toStringAsFixed(2)} x ${item.quantity}'),
                                                        ],
                                                      ),
                                                    ),
                                                    Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        IconButton(
                                                          icon: Icon(Icons.remove),
                                                          onPressed: () => _updateItemQuantity(item.id, item.quantity - 1),
                                                        ),
                                                        Text('${item.quantity}'),
                                                        IconButton(
                                                          icon: Icon(Icons.add),
                                                          onPressed: () => _updateItemQuantity(item.id, item.quantity + 1),
                                                        ),
                                                        IconButton(
                                                          icon: Icon(Icons.delete),
                                                          onPressed: () => _removeItemFromCart(item.id),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                ),
                                
                                SizedBox(height: 16),
                                
                                // Order Total
                                Container(
                                  padding: EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.green[50],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Total:',
                                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        '₹${_cartItems.fold(0, (sum, item) => sum + item.totalPrice).toStringAsFixed(2)}',
                                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ),
                                
                                SizedBox(height: 16),
                                
                                // Process Order Button
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: _processOrder,
                                    style: ElevatedButton.styleFrom(
                                      padding: EdgeInsets.symmetric(vertical: 16),
                                    ),
                                    child: Text(
                                      'Process Order',
                                      style: TextStyle(fontSize: 16),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}