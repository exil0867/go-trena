import 'package:flutter/material.dart';
import 'screens/auth/login_page.dart';
import 'screens/activities/activities_page.dart';

class WorkoutManagerApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Workout Manager',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => LoginPage(),
        '/activities': (context) => ActivitiesPage(),
      },
    );
  }
}
