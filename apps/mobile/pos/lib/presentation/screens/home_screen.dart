import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../services/auth_service.dart';
import '../screens/product_list_screen.dart';
import '../screens/order_list_screen.dart';
import '../screens/inventory_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final AuthService _authService = AuthService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('KN Biosciences POS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildFeatureCard(
              icon: Icons.inventory,
              title: 'Products',
              onTap: () => Get.to(() => const ProductListScreen()),
            ),
            _buildFeatureCard(
              icon: Icons.shopping_cart,
              title: 'Orders',
              onTap: () => Get.to(() => const OrderListScreen()),
            ),
            _buildFeatureCard(
              icon: Icons.store,
              title: 'Inventory',
              onTap: () => Get.to(() => const InventoryScreen()),
            ),
            _buildFeatureCard(
              icon: Icons.sync,
              title: 'Sync Data',
              onTap: _syncData,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 48,
              color: Colors.green,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _logout() async {
    await _authService.logout();
    Get.offAllNamed('/login');
  }

  void _syncData() {
    // In a real implementation, this would trigger the sync process
    Get.snackbar(
      'Sync Status',
      'Syncing data with server...',
      snackPosition: SnackPosition.BOTTOM,
    );
  }
}