import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart';
import './exercise_list_screen.dart';

class ExerciseGroupScreen extends StatefulWidget {
  final ApiService apiService;
  final Map<String, dynamic> plan;

  const ExerciseGroupScreen({
    required this.apiService,
    required this.plan,
    super.key,
  });

  @override
  _ExerciseGroupScreenState createState() => _ExerciseGroupScreenState();
}

class _ExerciseGroupScreenState extends State<ExerciseGroupScreen> {
  final List<bool> _expanded = List.generate(7, (_) => false);

  @override
  Widget build(BuildContext context) {
    return GlobalScaffold(
      apiService: widget.apiService,
      body: FutureBuilder<List<dynamic>?>(
        future: widget.apiService.getExerciseGroupsByPlan(widget.plan['id']),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || snapshot.data == null) {
            return const Center(child: Text('Error fetching exercise groups'));
          }

          final groups = snapshot.data!;
          final groupedByDay =
              List.generate(7, (index) => <Map<String, dynamic>>[]);
          for (var group in groups) {
            groupedByDay[group['day_of_week']].add(group);
          }

          return SingleChildScrollView(
            child: ExpansionPanelList(
              expansionCallback: (int index, bool isExpanded) {
                setState(() {
                  _expanded[index] = !_expanded[index];
                });
              },
              children: List.generate(7, (index) {
                return ExpansionPanel(
                  headerBuilder: (context, isExpanded) {
                    return ListTile(
                      title: Text(_getDayName(index)),
                    );
                  },
                  body: Column(
                    children: [
                      ...groupedByDay[index].map((group) {
                        return ListTile(
                          title: Text(group['name'] ?? 'Unnamed Group'),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ExerciseListScreen(
                                  apiService: widget.apiService,
                                  group: group,
                                ),
                              ),
                            );
                          },
                        );
                      }),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: ElevatedButton(
                          onPressed: () {
                            _showAddGroupDialog(context, index);
                          },
                          child: const Text('Add Exercise Group'),
                        ),
                      ),
                    ],
                  ),
                  isExpanded: _expanded[index],
                );
              }),
            ),
          );
        },
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

  void _showAddGroupDialog(BuildContext context, int dayOfWeek) {
    final nameController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add Exercise Group'),
          content: TextField(
            controller: nameController,
            decoration: const InputDecoration(labelText: 'Group Name'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final groupData = {
                  'plan_id': widget.plan['id'],
                  'name': nameController.text,
                  'day_of_week': dayOfWeek,
                };
                final success =
                    await widget.apiService.createExerciseGroup(groupData);
                if (success) {
                  Navigator.pop(context);
                  setState(() {});
                }
              },
              child: const Text('Add'),
            ),
          ],
        );
      },
    );
  }
}
