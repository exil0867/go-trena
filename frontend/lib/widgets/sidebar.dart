import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/activity.dart';
import '../screens/home_screen.dart';
import '../screens/activities_screen.dart';
import '../screens/plan_screen.dart';
import '../services/api_service.dart';

class Sidebar extends StatefulWidget {
  final ApiService apiService;

  const Sidebar({required this.apiService, super.key});

  @override
  _SidebarState createState() => _SidebarState();
}

class _SidebarState extends State<Sidebar> {
  @override
  void initState() {
    super.initState();
    _loadActivities();
  }

  Future<void> _loadActivities() async {
    final activities = await widget.apiService.getActivities();
    Provider.of<ActivityProvider>(context, listen: false)
        .setActivities(activities);
  }

  @override
  Widget build(BuildContext context) {
    final activityProvider = Provider.of<ActivityProvider>(context);
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: <Widget>[
          // Drawer header with activity switching box
          DrawerHeader(
            decoration: const BoxDecoration(
              color: Colors.blue,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Menu',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge!
                      .copyWith(color: Colors.white),
                ),
                const SizedBox(height: 20),
                // Activity switching dropdown
                DropdownButton<Activity>(
                  value: activityProvider.selectedActivity,
                  hint: const Text(
                    "Select Activity",
                    style: TextStyle(color: Colors.white),
                  ),
                  dropdownColor: Colors.blue,
                  iconEnabledColor: Colors.white,
                  underline: Container(), // Remove default underline
                  items: activityProvider.activities.map((activity) {
                    return DropdownMenuItem<Activity>(
                      value: activity,
                      child: Text(activity.name,
                          style: const TextStyle(color: Colors.white)),
                    );
                  }).toList(),
                  onChanged: (Activity? newValue) {
                    if (newValue != null) {
                      activityProvider.selectActivity(newValue);
                      // You can add additional logic here (e.g., refreshing screens)
                    }
                  },
                ),
              ],
            ),
          ),

          // Home link
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('Home'),
            onTap: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                    builder: (_) => HomeScreen(apiService: widget.apiService)),
              );
            },
          ),
          // Activities link
          ListTile(
            leading: const Icon(Icons.list),
            title: const Text('Activities'),
            onTap: () {
              final selected = activityProvider.selectedActivity!;
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                    builder: (_) => ActivitiesScreen(
                        apiService: widget.apiService, activity: selected)),
              );
            },
          ),
          // Plans link
          ListTile(
            leading: const Icon(Icons.place_rounded),
            title: const Text('Plans'),
            onTap: () {
              final selected = activityProvider.selectedActivity!;
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (_) => PlansScreen(
                    apiService: widget.apiService,
                    activity: selected,
                  ),
                ),
              );
            },
          ),
          // Logout link
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Logout'),
            onTap: () {
              // Implement logout functionality here.
            },
          ),
        ],
      ),
    );
  }
}
