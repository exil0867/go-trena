import 'package:flutter/material.dart';
import '../models/activity.dart';
import '../services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart';
import 'plan_screen.dart';
import './exercise_group_screen.dart';

class AddPlanScreen extends StatelessWidget {
  final ApiService apiService;
  final String activityId;
  final TextEditingController planController = TextEditingController();

  AddPlanScreen(
      {required this.apiService, required this.activityId, super.key});

  void _addPlan(BuildContext context) async {
    final planData = {
      'name': planController.text,
      'user_activity_id': activityId
    };
    final success = await apiService.createPlan(planData);
    if (success) {
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to add plan')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Plan')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
                controller: planController,
                decoration: const InputDecoration(labelText: 'Plan Name')),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => _addPlan(context),
              child: const Text('Add Plan'),
            ),
          ],
        ),
      ),
    );
  }
}

class PlansScreen extends StatelessWidget {
  final ApiService apiService;
  final Activity activity;

  const PlansScreen(
      {required this.apiService, required this.activity, super.key});

  @override
  Widget build(BuildContext context) {
    return GlobalScaffold(
      apiService: apiService,
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<List<dynamic>?>(
              future: apiService.getPlans(activity.id),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || snapshot.data == null) {
                  return const Center(child: Text('Error fetching plans'));
                }
                final plans = snapshot.data!;
                return ListView.builder(
                  itemCount: plans.length,
                  itemBuilder: (context, index) {
                    final plan = plans[index];
                    return ListTile(
                      title: Text(plan['name'] ?? 'Unnamed'),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ExerciseGroupScreen(
                              apiService: apiService,
                              plan: plan,
                            ),
                          ),
                        );
                      },
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AddPlanScreen(
                      apiService: apiService,
                      activityId: activity.id,
                    ),
                  ),
                );
              },
              child: const Text('Add Plan'),
            ),
          ),
        ],
      ),
    );
  }
}
