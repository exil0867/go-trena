import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Dialog,
  Portal,
  TextInput,
  Button,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { createPlan, fetchPlansById } from '../lib/api';

interface Plan {
  id: string;
  name: string;
  activity_id: string;
}

export default function PlansScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const { selectedActivity } = useAppContext();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (selectedActivity) {
      handleFetchPlans();
    }
  }, [selectedActivity]);

  const handleFetchPlans = async () => {
    if (!selectedActivity) return;

    setLoading(true);
    try {
      const data = await fetchPlansById(selectedActivity.id);

      if (data && Array.isArray(data)) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedActivity || !newPlanName.trim()) return;

    try {
      const newPlan = await createPlan(selectedActivity.id, newPlanName);
      setPlans([...plans, newPlan]);
      setNewPlanName('');
      setVisible(false);
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handlePlanPress = (plan: Plan) => {
    navigation.navigate('PlanDetail', { plan });
  };

  const renderItem = ({ item }: { item: Plan }) => (
    <Card
      style={styles.card}
      onPress={() => handlePlanPress(item)}
    >
      <Card.Content>
        <Text style={styles.planName}>{item.name}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {!selectedActivity ? (
        <View style={styles.noActivity}>
          <Text style={styles.noActivityText}>
            Please select an activity from the drawer menu
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <>
          {plans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No plans found</Text>
              <Text style={styles.emptySubtext}>
                Create your first training plan by clicking the + button
              </Text>
            </View>
          ) : (
            <FlatList
              data={plans}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}

          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setVisible(true)}
          />

          <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
              <Dialog.Title>Create New Plan</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  label="Plan Name"
                  value={newPlanName}
                  onChangeText={setNewPlanName}
                  mode="outlined"
                  style={styles.input}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setVisible(false)}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={handleCreatePlan}
                  disabled={!newPlanName.trim()}
                >
                  Create
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  noActivity: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noActivityText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4A90E2',
  },
  input: {
    marginTop: 8,
  },
});
