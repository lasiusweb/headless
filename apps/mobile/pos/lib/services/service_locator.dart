import 'package:get_it/get_it.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

import '../services/api_service.dart';
import '../services/database_service.dart';
import '../services/auth_service.dart';
import '../services/inventory_service.dart';
import '../services/order_service.dart';
import '../services/sync_service.dart';

final getIt = GetIt.instance;

Future<void> setupServiceLocator() async {
  // External dependencies
  getIt.registerSingleton<http.Client>(http.Client());
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(sharedPreferences);
  
  // Initialize database
  final database = await openDatabase('pos_database.db');
  getIt.registerSingleton<Database>(database);
  
  // Services
  getIt.registerSingleton<ApiService>(ApiService());
  getIt.registerSingleton<DatabaseService>(DatabaseService());
  getIt.registerSingleton<AuthService>(AuthService());
  getIt.registerSingleton<InventoryService>(InventoryService());
  getIt.registerSingleton<OrderService>(OrderService());
  getIt.registerSingleton<SyncService>(SyncService());
}