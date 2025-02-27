import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  final SupabaseClient client;

  SupabaseService(this.client);

  /// Logs in the user with email and password.
  /// On success the Supabase client stores the token and user info.
  Future<bool> login(String email, String password) async {
    try {
      final AuthResponse response = await client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      if (response.session == null) {
        print("Login error: Session is null");
        return false;
      }
      return true;
    } catch (e) {
      print("Login error: $e");
      return false;
    }
  }

  /// Signs up a new user with email and password.
  Future<bool> signUp(String email, String password) async {
    try {
      final AuthResponse response = await client.auth.signUp(
        email: email,
        password: password,
      );
      // Check if either a session or user was returned.
      if (response.session == null && response.user == null) {
        print("Signup error: No session or user returned");
        return false;
      }
      return true;
    } catch (e) {
      print("Signup error: $e");
      return false;
    }
  }
}
