


import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/api_service.dart';
import '../services/supabase_service.dart';
import '../screens/plan_screen.dart';
import '../screens/home_screen.dart';
import '../screens/activities_screen.dart';

class ActivitiesScreen extends StatelessWidget {
  final ApiService apiService;

  const ActivitiesScreen({required this.apiService, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // This screen shows user activities and provides a way to add new ones.
    return Scaffold(
      appBar: AppBar(title: const Text('User Activities')),
      body: FutureBuilder<List<dynamic>?>(
        future: apiService.getUserActivities(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError || snapshot.data == null) return const Center(child: Text('Error fetching activities'));
          final activities = snapshot.data!;
          return ListView.builder(
            itemCount: activities.length,
            itemBuilder: (context, index) {
              final activity = activities[index];
              return ListTile(
  title: Text(activity['activities']['name'] ?? 'Activity'),
  onTap: () {
    // Navigate to activity details or perform an action
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => 
      PlansScreen(apiService: apiService, activity: activity),
      ),
    );
  },
);
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to a screen to add a new activity.
          Navigator.push(context, MaterialPageRoute(builder: (_) => AddActivityScreen(apiService: apiService)));
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

class AddActivityScreen extends StatelessWidget {
  final ApiService apiService;
  final TextEditingController activityController = TextEditingController();

  AddActivityScreen({required this.apiService, Key? key}) : super(key: key);

  void _addActivity(BuildContext context) async {
    final activityData = {'name': activityController.text /*, add other fields if needed */};
    final success = await apiService.addUserActivity(activityData);
    if (success) {
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to add activity')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Activity')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(controller: activityController, decoration: const InputDecoration(labelText: 'Activity Name')),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => _addActivity(context),
              child: const Text('Add Activity'),
            ),
          ],
        ),
      ),
    );
  }
}
