import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/global_scaffold.dart';
import 'dart:convert';

class CategoriesScreen extends StatelessWidget {
  final ApiService apiService;

  const CategoriesScreen({
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
              future: apiService.getExerciseCategories(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || snapshot.data == null) {
                  return const Center(child: Text('Error fetching categories'));
                }

                final categories = snapshot.data!;
                return ListView.builder(
                  itemCount: categories.length,
                  itemBuilder: (context, index) {
                    final category = categories[index];
                    return ListTile(
                      title: Text(category['name'] ?? 'Unnamed Category'),
                      subtitle:
                          Text('Fields: ${category['measurement_fields']}'),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: () => _showAddCategoryDialog(context),
              child: const Text('Add Category'),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddCategoryDialog(BuildContext context) {
    final nameController = TextEditingController();
    final fieldsController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add Category'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Category Name'),
              ),
              TextField(
                controller: fieldsController,
                decoration: const InputDecoration(
                  labelText: 'Measurement Fields',
                  hintText: 'Enter fields as JSON array e.g. ["sets","reps"]',
                ),
                maxLines: 2,
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
                try {
                  final fields = json.decode(fieldsController.text);
                  final categoryData = {
                    'name': nameController.text,
                    'measurement_fields': fields,
                  };
                  final success =
                      await apiService.createExerciseCategory(categoryData);
                  if (success) {
                    Navigator.pop(context);
                    if (context.mounted) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              CategoriesScreen(apiService: apiService),
                        ),
                      );
                    }
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Invalid JSON format for fields')),
                  );
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
