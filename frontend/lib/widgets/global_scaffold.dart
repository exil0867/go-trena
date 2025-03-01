import 'package:flutter/material.dart';
import '../widgets/sidebar.dart';
import '../services/api_service.dart';

class GlobalScaffold extends StatelessWidget {
  final Widget body;
  final String title;
  final ApiService apiService;

  const GlobalScaffold({
    super.key,
    required this.body,
    required this.apiService,
    this.title = '',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      drawer: Sidebar(apiService: apiService),
      body: body,
    );
  }
}
