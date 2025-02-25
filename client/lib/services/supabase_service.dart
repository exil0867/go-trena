import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  final _client = Supabase.instance.client;

  Future<bool> login({required String email, required String password}) async {
    final response = await _client.auth.signInWithPassword(email: email, password: password);
    return response.user != null;
  }

  Future<bool> signUp({required String email, required String password}) async {
    final response = await _client.auth.signUp(email: email, password: password);
    return response.user != null;
  }
}
