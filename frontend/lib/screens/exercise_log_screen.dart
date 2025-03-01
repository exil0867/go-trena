import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart';
import 'package:intl/intl.dart';

class ExerciseLogScreen extends StatelessWidget {
  final ApiService apiService;

  const ExerciseLogScreen({
    required this.apiService,
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
              future: apiService.getExerciseLogsByUser(apiService.userId ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || snapshot.data == null) {
                  return const Center(
                      child: Text('Error fetching exercise logs'));
                }

                final logs = snapshot.data!;
                return ListView.builder(
                  itemCount: logs.length,
                  itemBuilder: (context, index) {
                    final log = logs[index];
                    final date = DateTime.parse(log['date']);
                    final formattedDate =
                        DateFormat('MMM d, yyyy').format(date);
                    final metrics = Map<String, dynamic>.from(log['metrics']);

                    return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16.0,
                        vertical: 8.0,
                      ),
                      child: ListTile(
                        title:
                            Text(log['exercise']['name'] ?? 'Unknown Exercise'),
                        subtitle: Text(
                          '$formattedDate\nReps: ${metrics['reps']}, Weight: ${metrics['weight']}kg',
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: () => _showLogExerciseDialog(context),
              child: const Text('Log Exercise'),
            ),
          ),
        ],
      ),
    );
  }

  void _showLogExerciseDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    String? selectedExerciseId;
    final repsController = TextEditingController();
    final weightController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Log Exercise'),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    FutureBuilder<List<dynamic>?>(
                      future: apiService.getAllExercises(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const CircularProgressIndicator();
                        }
                        if (snapshot.hasError || snapshot.data == null) {
                          return const Text('Error loading exercises');
                        }

                        final exercises = snapshot.data!;
                        return DropdownButtonFormField<String>(
                          value: selectedExerciseId,
                          decoration: const InputDecoration(
                            labelText: 'Exercise',
                            border: OutlineInputBorder(),
                          ),
                          items: exercises
                              .map<DropdownMenuItem<String>>((exercise) {
                            return DropdownMenuItem<String>(
                              value: exercise['id'],
                              child: Text(exercise['name']),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              selectedExerciseId = value;
                            });
                          },
                          validator: (value) {
                            if (value == null) {
                              return 'Please select an exercise';
                            }
                            return null;
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: repsController,
                      decoration: const InputDecoration(
                        labelText: 'Reps',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter number of reps';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: weightController,
                      decoration: const InputDecoration(
                        labelText: 'Weight (kg)',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter weight';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (formKey.currentState!.validate()) {
                      final now = DateTime.now();
                      final logData = {
                        'exercise_id': selectedExerciseId,
                        'user_id': apiService.userId,
                        'date': DateFormat('yyyy-MM-dd').format(now),
                        'metrics': {
                          'reps': int.parse(repsController.text),
                          'weight': double.parse(weightController.text),
                        },
                      };

                      final success = await apiService.logExercise(logData);
                      if (success) {
                        Navigator.pop(context);
                        if (context.mounted) {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ExerciseLogScreen(
                                apiService: apiService,
                              ),
                            ),
                          );
                        }
                      } else {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Failed to log exercise'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      }
                    }
                  },
                  child: const Text('Log'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
