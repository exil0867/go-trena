import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'services/supabase_service.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: 'http://127.0.0.1:54221',
    anonKey: 'YOUR_ANON_KEY_HERE',
  );
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  final SupabaseService supabaseService =
      SupabaseService(Supabase.instance.client);
  final ApiService apiService = ApiService(baseUrl: 'http://localhost:3004');

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Workout App',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: LoginScreen(
        supabaseService: supabaseService,
        apiService: apiService,
      ),
    );
  }
}
