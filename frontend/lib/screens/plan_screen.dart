import 'package:flutter/material.dart';
import '../models/activity.dart';
import '../services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart';
import './exercise_group_screen.dart';
import './exercise_list_screen.dart';

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

class PlansScreen extends StatefulWidget {
  final ApiService apiService;
  final Activity activity;

  const PlansScreen(
      {required this.apiService, required this.activity, super.key});

  @override
  _PlansScreenState createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  List<bool> _isExpanded = [];
  bool _isInitialized = false;

  @override
  Widget build(BuildContext context) {
    return GlobalScaffold(
      apiService: widget.apiService,
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<List<dynamic>?>(
              future: widget.apiService.getPlans(widget.activity.id),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || snapshot.data == null) {
                  return const Center(child: Text('Error fetching plans'));
                }
                final plans = snapshot.data!;
                if (!_isInitialized) {
                  _isExpanded = List<bool>.filled(plans.length, false);
                  _isInitialized = true;
                }
                return SingleChildScrollView(
                  child: ExpansionPanelList(
                    expansionCallback: (int index, bool isExpanded) {
                      setState(() {
                        _isExpanded[index] = !_isExpanded[index];
                      });
                    },
                    children: plans.map<ExpansionPanel>((plan) {
                      final index = plans.indexOf(plan);
                      return ExpansionPanel(
                        headerBuilder: (BuildContext context, bool isExpanded) {
                          return ListTile(
                            title: Text(plan['name'] ?? 'Unnamed'),
                          );
                        },
                        body: FutureBuilder<List<dynamic>?>(
                          future: widget.apiService
                              .getExerciseGroupsByPlan(plan['id']),
                          builder: (context, snapshot) {
                            if (snapshot.connectionState ==
                                ConnectionState.waiting) {
                              return const Center(
                                  child: CircularProgressIndicator());
                            }
                            if (snapshot.hasError || snapshot.data == null) {
                              return const Center(
                                  child:
                                      Text('Error fetching exercise groups'));
                            }
                            final groups = snapshot.data!;
                            return Column(
                              children: [
                                ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: groups.length,
                                  itemBuilder: (context, index) {
                                    final group = groups[index];
                                    return ListTile(
                                      title: Text(
                                          group['name'] ?? 'Unnamed Group'),
                                      subtitle: Text(
                                          'Day: ${_getDayName(group['day_of_week'])}'),
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
                                  },
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: ElevatedButton(
                                    onPressed: () {
                                      _showAddGroupDialog(context, plan);
                                    },
                                    child: const Text('Add Exercise Group'),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                        isExpanded: _isExpanded[index],
                      );
                    }).toList(),
                  ),
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
                      apiService: widget.apiService,
                      activityId: widget.activity.id,
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

  void _showAddGroupDialog(BuildContext context, Map<String, dynamic> plan) {
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
      },
    );
  }
}
