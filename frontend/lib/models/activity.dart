// Define an Activity model.
// ActivityProvider to manage global state.
import 'package:flutter/foundation.dart';

class Activity {
  final String id;
  final String name;
  final String description;

  Activity({
    required this.id,
    required this.name,
    required this.description,
  });

  // Factory constructor to create an Activity from JSON.
  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Activity && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

class ActivityProvider extends ChangeNotifier {
  Activity? _selectedActivity;
  List<Activity> _activities = [];

  Activity? get selectedActivity => _selectedActivity;
  List<Activity> get activities => _activities;

  void setActivities(List<Activity> activities) {
    _activities = activities;
    // Optionally, set a default selected activity if one isn't set.
    if (_activities.isNotEmpty && _selectedActivity == null) {
      _selectedActivity = _activities.first;
    }
    notifyListeners();
  }

  void selectActivity(Activity activity) {
    _selectedActivity = activity;
    notifyListeners();
  }
}
