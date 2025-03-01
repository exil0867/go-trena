import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/api_service.dart';
import '../services/supabase_service.dart';
import '../screens/plan_screen.dart';
import '../screens/home_screen.dart';

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool isLogin = true;
  String message = '';

  void _authenticate() async {
    bool success;
    if (isLogin) {
      success = await widget.supabaseService
          .login(emailController.text, passwordController.text);
    } else {
      success = await widget.supabaseService
          .signUp(emailController.text, passwordController.text);
    }
    if (success) {
      // Retrieve session details from Supabase and set them in the API service.
      final session = Supabase.instance.client.auth.currentSession;
      if (session != null) {
        widget.apiService.setAuthToken(session.accessToken);
        widget.apiService.setUserId(session.user.id);
      }
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
            builder: (_) => HomeScreen(apiService: widget.apiService)),
      );
    } else {
      setState(() {
        message = 'Authentication failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(isLogin ? 'Login' : 'Sign Up')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
                controller: emailController,
                decoration: const InputDecoration(labelText: 'Email')),
            TextField(
              controller: passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _authenticate,
              child: Text(isLogin ? 'Login' : 'Sign Up'),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  isLogin = !isLogin;
                  message = '';
                });
              },
              child: Text(isLogin
                  ? 'Need to create an account? Sign Up'
                  : 'Already have an account? Login'),
            ),
            if (message.isNotEmpty)
              Text(message, style: const TextStyle(color: Colors.red)),
          ],
        ),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  final SupabaseService supabaseService;
  final ApiService apiService;

  const LoginScreen(
      {required this.supabaseService, required this.apiService, super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}
