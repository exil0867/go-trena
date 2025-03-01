import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart';

class ExerciseListScreen extends StatelessWidget {
  final ApiService apiService;
  final Map<String, dynamic> group;

  const ExerciseListScreen({
    required this.apiService,
    required this.group,
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
              future: apiService.getExercisesByGroup(group['id']),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || snapshot.data == null) {
                  print("$group hi");
                  return const Center(child: Text('Error fetching exercises'));
                }

                final exercises = snapshot.data!;
                return ListView.builder(
                  itemCount: exercises.length,
                  itemBuilder: (context, index) {
                    final exercise = exercises[index];
                    return ListTile(
                      title: Text(exercise['name'] ?? 'Unnamed Exercise'),
                      subtitle:
                          Text(exercise['description'] ?? 'No description'),
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
                _showAddExerciseDialog(context);
              },
              child: const Text('Add Exercise'),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddExerciseDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    String? selectedCategoryId;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Add Exercise'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration:
                        const InputDecoration(labelText: 'Exercise Name'),
                  ),
                  TextField(
                    controller: descriptionController,
                    decoration: const InputDecoration(labelText: 'Description'),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  FutureBuilder<List<dynamic>?>(
                    future: apiService.getExerciseCategories(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const CircularProgressIndicator();
                      }
                      if (snapshot.hasError || snapshot.data == null) {
                        return const Text('Error loading categories');
                      }

                      final categories = snapshot.data!;
                      return DropdownButton<String>(
                        value: selectedCategoryId,
                        hint: const Text('Select Category'),
                        isExpanded: true,
                        items: categories
                            .map<DropdownMenuItem<String>>((category) {
                          return DropdownMenuItem<String>(
                            value: category['id'],
                            child: Text(category['name']),
                          );
                        }).toList(),
                        onChanged: (String? value) {
                          setState(() {
                            selectedCategoryId = value;
                          });
                        },
                      );
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
                    if (selectedCategoryId == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Please select a category')),
                      );
                      return;
                    }

                    final exerciseData = {
                      'exercise_group_id': group['id'],
                      'name': nameController.text,
                      'description': descriptionController.text,
                      'category_id': selectedCategoryId,
                    };
                    final success =
                        await apiService.createExercise(exerciseData);
                    if (success) {
                      Navigator.pop(context);
                      if (context.mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ExerciseListScreen(
                              apiService: apiService,
                              group: group,
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
