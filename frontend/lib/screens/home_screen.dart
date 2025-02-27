
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/api_service.dart';
import '../services/supabase_service.dart';
import '../screens/plan_screen.dart';
import '../screens/home_screen.dart';
import '../screens/activities_screen.dart';

class HomeScreen extends StatefulWidget {
  final ApiService apiService;

  const HomeScreen({required this.apiService, Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

/// HomeScreen with bottom tabs (e.g. Activities and Plans)
class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  late List<Widget> _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = [
      ActivitiesScreen(apiService: widget.apiService),
      PlansScreen(apiService: widget.apiService),
      // Additional tabs (like Workouts or Logs) can be added here.
    ];
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _tabs[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.list), label: 'Activities'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Plans'),
        ],
      ),
    );
  }
}