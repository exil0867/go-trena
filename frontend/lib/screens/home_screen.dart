import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart'; // adjust the import path as necessary

class HomeScreen extends StatelessWidget {
  final ApiService apiService;

  const HomeScreen({super.key, required this.apiService});

  @override
  Widget build(BuildContext context) {
    return GlobalScaffold(
      title: 'Workout App Home',
      apiService: apiService,
      body: const Center(
        child: Text('Welcome to the Workout App Home!'),
      ),
    );
  }
}
