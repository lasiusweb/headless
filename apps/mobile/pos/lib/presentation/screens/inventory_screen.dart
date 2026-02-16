import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_it/get_it.dart';

import '../../models/inventory_item.dart';
import '../../services/inventory_service.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({Key? key}) : super(key: key);

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final InventoryService _inventoryService = GetIt.instance.get<InventoryService>();
  List<InventoryItem> _inventoryItems = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadInventory();
  }

  void _loadInventory() async {
    setState(() {
      _isLoading = true;
    });

    try {
      _inventoryItems = await _inventoryService.getAllInventory();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading inventory: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadInventory,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _inventoryItems.isEmpty
              ? const Center(child: Text('No inventory items found'))
              : ListView.builder(
                  itemCount: _inventoryItems.length,
                  itemBuilder: (context, index) {
                    final item = _inventoryItems[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        title: Text('Product ID: ${item.productId}'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Stock Level: ${item.stockLevel}'),
                            Text('Reserved: ${item.reservedQuantity}'),
                            Text('Available: ${item.availableQuantity}'),
                            Text('Warehouse: ${item.warehouseId ?? 'N/A'}'),
                          ],
                        ),
                        trailing: const Icon(Icons.inventory),
                        onTap: () {
                          _showInventoryDetails(item);
                        },
                      ),
                    );
                  },
                ),
    );
  }

  void _showInventoryDetails(InventoryItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Inventory Details'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Product ID: ${item.productId}'),
            Text('Stock Level: ${item.stockLevel}'),
            Text('Reserved Quantity: ${item.reservedQuantity}'),
            Text('Available Quantity: ${item.availableQuantity}'),
            Text('Warehouse ID: ${item.warehouseId ?? 'N/A'}'),
            const SizedBox(height: 10),
            const Text(
              'Update Stock Level:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            TextField(
              decoration: const InputDecoration(
                hintText: 'Enter new stock level',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              onSubmitted: (value) {
                _updateStockLevel(item.productId, int.tryParse(value) ?? 0);
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Get the value from the text field
              Navigator.pop(context);
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _updateStockLevel(String productId, int newStockLevel) {
    // In a real implementation, this would update the local database
    // and add to the sync queue for later synchronization
    Get.snackbar(
      'Stock Updated',
      'Stock level for product $productId updated to $newStockLevel',
      snackPosition: SnackPosition.BOTTOM,
    );
  }
}