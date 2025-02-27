import 'package:flutter/material.dart';

class ActivityDetailScreen extends StatelessWidget {
  final Map<String, dynamic> activity;

  const ActivityDetailScreen({Key? key, required this.activity}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(activity['name'] ?? 'Activity Details')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(activity['description'] ?? 'No description available'),
      ),
    );
  }
}
