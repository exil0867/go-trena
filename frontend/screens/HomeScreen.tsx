import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { fetchLogs, fetchPlansById } from '../lib/api';

interface ExerciseLog {
  id: string;
  exercise_name: string;
  created_at: string;
}

interface Plan {
  id: string;
  name: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { selectedActivity } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentLogs, setRecentLogs] = useState<ExerciseLog[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (selectedActivity) {
      loadHomeData();
    } else {
      setLoading(false);
    }
  }, [selectedActivity]);

  const loadHomeData = async () => {
    if (!selectedActivity) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchUserData(),
        fetchRecentLogs(),
        fetchPlans()
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const fetchUserData = async () => {
    try {
      const user = await supabase.auth.getUser();
      setUserData(user.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (userId) {
        // const response = await fetch(`/users/${userId}/exercise-logs?limit=5`);
        const data = await fetchLogs();

        if (data && Array.isArray(data)) {
          data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setRecentLogs(data);
        }
      }
    } catch (error) {
      console.error('Error fetching recent logs:', error);
    }
  };

  const fetchPlans = async () => {
    if (!selectedActivity) return;

    try {
      const data = await fetchPlansById(selectedActivity.id);

      if (data && Array.isArray(data)) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const navigateToPlans = () => {
    navigation.navigate('Plans');
  };

  const navigateToExercises = () => {
    navigation.navigate('Exercises');
  };

  const navigateToLogs = () => {
    navigation.navigate('Logs');
  };

  const navigateToPlanDetail = (plan: Plan) => {
    navigation.navigate('PlanDetail', { plan });
  };

  if (!selectedActivity) {
    return (
      <View style={styles.noActivity}>
        <Text style={styles.noActivityText}>
          Please select an activity from the drawer menu
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Text style={styles.welcomeTitle}>
            Welcome{userData ? `, ${userData.email}` : ''}!
          </Text>
        </Card.Content>
      </Card>
      <Divider />
      <Button mode="contained" onPress={navigateToPlans}>
        View Plans
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noActivity: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noActivityText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  welcomeCard: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
