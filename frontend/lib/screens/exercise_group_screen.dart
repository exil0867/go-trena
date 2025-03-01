import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart';
import './exercise_list_screen.dart';

class ExerciseGroupScreen extends StatelessWidget {
  final ApiService apiService;
  final Map<String, dynamic> plan;

  const ExerciseGroupScreen({
    required this.apiService,
    required this.plan,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GlobalScaffold(
      apiService: apiService,
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<List<dynamic>?>(
              future: apiService.getExerciseGroupsByPlan(plan['id']),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || snapshot.data == null) {
                  return const Center(
                      child: Text('Error fetching exercise groups'));
                }

                final groups = snapshot.data!;
                return ListView.builder(
                  itemCount: groups.length,
                  itemBuilder: (context, index) {
                    final group = groups[index];
                    return ListTile(
                      title: Text(group['name'] ?? 'Unnamed Group'),
                      subtitle:
                          Text('Day: ${_getDayName(group['day_of_week'])}'),
                      onTap: () {
                        // Navigate to exercises list for this group
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ExerciseListScreen(
                              apiService: apiService,
                              group: group,
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
                _showAddGroupDialog(context);
              },
              child: const Text('Add Exercise Group'),
            ),
          ),
        ],
      ),
    );
  }

  String _getDayName(int dayOfWeek) {
    final days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    return days[dayOfWeek];
  }

  void _showAddGroupDialog(BuildContext context) {
    final nameController = TextEditingController();
    int selectedDay = 0;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Add Exercise Group'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(labelText: 'Group Name'),
                  ),
                  const SizedBox(height: 16),
                  DropdownButton<int>(
                    value: selectedDay,
                    items: List.generate(7, (index) {
                      return DropdownMenuItem(
                        value: index,
                        child: Text(_getDayName(index)),
                      );
                    }),
                    onChanged: (value) {
                      setState(() {
                        selectedDay = value!;
                      });
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final groupData = {
                      'plan_id': plan['id'],
                      'name': nameController.text,
                      'day_of_week': selectedDay,
                    };
                    final success =
                        await apiService.createExerciseGroup(groupData);
                    if (success) {
                      Navigator.pop(context);
                      // Refresh the screen
                      if (context.mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ExerciseGroupScreen(
                              apiService: apiService,
                              plan: plan,
                            ),
                          ),
                        );
                      }
                    }
                  },
                  child: const Text('Add'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
