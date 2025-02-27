import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  final String baseUrl;
  String? authToken;
  String? userId;

  ApiService({required this.baseUrl});

  /// Set the auth token (retrieved from Supabase after login)
  void setAuthToken(String token) {
    authToken = token;
  }

  /// Store the user id (from Supabase)
  void setUserId(String id) {
    userId = id;
  }

  Map<String, String> _headers() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    if (authToken != null) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }

  Future<Map<String, dynamic>?> getPlan(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/plans/$id'), headers: _headers());
    if (response.statusCode == 200) return json.decode(response.body);
    return null;
  }

  Future<List<dynamic>?> getPlans() async {
    final response = await http.get(Uri.parse('$baseUrl/plans'), headers: _headers());
    if (response.statusCode == 200) {
      return json.decode(response.body) as List;
    }
    return null;
  }

  Future<bool> createPlan(Map<String, dynamic> planData) async {
    final response = await http.post(Uri.parse('$baseUrl/plans'),
        headers: _headers(), body: json.encode(planData));
    return response.statusCode == 201;
  }

  Future<List<dynamic>?> getExerciseGroupsByPlan(String planId) async {
    final response = await http.get(Uri.parse('$baseUrl/plans/$planId/groups'), headers: _headers());
    if (response.statusCode == 200) return json.decode(response.body) as List;
    return null;
  }

  Future<bool> createExerciseGroup(Map<String, dynamic> groupData) async {
    final response = await http.post(Uri.parse('$baseUrl/exercise-groups'),
        headers: _headers(), body: json.encode(groupData));
    return response.statusCode == 201;
  }

  Future<List<dynamic>?> getExerciseCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/exercise-categories'), headers: _headers());
    if (response.statusCode == 200) return json.decode(response.body) as List;
    return null;
  }

  Future<bool> createExerciseCategory(Map<String, dynamic> categoryData) async {
    final response = await http.post(Uri.parse('$baseUrl/exercise-categories'),
        headers: _headers(), body: json.encode(categoryData));
    return response.statusCode == 201;
  }

  Future<bool> logExercise(Map<String, dynamic> logData) async {
    final response = await http.post(Uri.parse('$baseUrl/exercise-logs'),
        headers: _headers(), body: json.encode(logData));
    return response.statusCode == 201;
  }

  Future<List<dynamic>?> getExerciseLogsByUser(String userId) async {
    final response = await http.get(Uri.parse('$baseUrl/users/$userId/exercise-logs'), headers: _headers());
    if (response.statusCode == 200) return json.decode(response.body) as List;
    return null;
  }

  Future<List<dynamic>?> getActivities() async {
    final response = await http.get(Uri.parse('$baseUrl/activities'), headers: _headers());
    if (response.statusCode == 200) return json.decode(response.body) as List;
    return null;
  }

  Future<bool> addUserActivity(Map<String, dynamic> activityData) async {
    print("the headers ${_headers()}");
    final response = await http.post(Uri.parse('$baseUrl/user-activities'),
        headers: _headers(), body: json.encode(activityData));
    return response.statusCode == 201;
  }

  Future<List<dynamic>?> getUserActivities() async {
    final response = await http.get(Uri.parse('$baseUrl/user-activities'), headers: _headers());
    if (response.statusCode == 200) return json.decode(response.body) as List;
    return null;
  }
}
