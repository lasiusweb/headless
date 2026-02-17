import 'package:barcode_scan2/barcode_scan2.dart';
import 'package:logger/logger.dart';
import 'database_service.dart';

class BarcodeScannerService {
  static final BarcodeScannerService _instance = BarcodeScannerService._internal();
  factory BarcodeScannerService() => _instance;
  BarcodeScannerService._internal();

  final Logger _logger = Logger();
  final DatabaseService _databaseService = DatabaseService();

  /// Scan barcode using device camera
  Future<ScanResult> scanBarcode() async {
    try {
      var options = ScanOptions(
        strings: {
          "cancel": "Cancel",
          "flash_on": "Flash on",
          "flash_off": "Flash off",
        },
        useAutoFocus: true,
        autoEnableFlash: false,
      );

      var result = await BarcodeScan.scan(options);
      
      if (result.rawContent.isNotEmpty) {
        _logger.d('Scanned barcode: ${result.rawContent}');
        
        // Look up product by barcode
        final product = await lookupProductByBarcode(result.rawContent);
        
        return ScanResult(
          barcode: result.rawContent,
          format: result.format,
          product: product,
          success: true,
        );
      }
      
      return ScanResult(
        barcode: '',
        format: result.format,
        success: false,
        error: 'No barcode detected',
      );
    } catch (e) {
      _logger.e('Error scanning barcode: $e');
      return ScanResult(
        barcode: '',
        format: BarcodeFormat.unknown,
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Lookup product by barcode in local database
  Future<Map<String, dynamic>?> lookupProductByBarcode(String barcode) async {
    try {
      final db = await _databaseService.database;
      final results = await db.query(
        'products',
        where: 'barcode = ?',
        whereArgs: [barcode],
      );

      if (results.isNotEmpty) {
        return results.first;
      }

      _logger.w('Product not found for barcode: $barcode');
      return null;
    } catch (e) {
      _logger.e('Error looking up product: $e');
      return null;
    }
  }

  /// Lookup product by SKU
  Future<Map<String, dynamic>?> lookupProductBySku(String sku) async {
    try {
      final db = await _databaseService.database;
      final results = await db.query(
        'products',
        where: 'sku = ?',
        whereArgs: [sku],
      );

      if (results.isNotEmpty) {
        return results.first;
      }

      _logger.w('Product not found for SKU: $sku');
      return null;
    } catch (e) {
      _logger.e('Error looking up product: $e');
      return null;
    }
  }

  /// Search products by name or SKU
  Future<List<Map<String, dynamic>>> searchProducts(String query) async {
    try {
      final db = await _databaseService.database;
      final results = await db.query(
        'products',
        where: 'name LIKE ? OR sku LIKE ?',
        whereArgs: ['%$query%', '%$query%'],
        limit: 20,
      );

      return results;
    } catch (e) {
      _logger.e('Error searching products: $e');
      return [];
    }
  }
}

/// Scan result class
class ScanResult {
  final String barcode;
  final BarcodeFormat format;
  final Map<String, dynamic>? product;
  final bool success;
  final String? error;

  ScanResult({
    required this.barcode,
    required this.format,
    this.product,
    required this.success,
    this.error,
  });
}
