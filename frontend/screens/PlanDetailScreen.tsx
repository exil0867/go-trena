import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Text,
  List,
  Button,
  Dialog,
  Portal,
  TextInput,
  ActivityIndicator,
  FAB,
  Divider
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createExerciseGroup, fetchExerciseGroupsByPlan } from '../lib/api';

interface Plan {
  id: string;
  name: string;
  activity_id: string;
}

interface ExerciseGroup {
  id: string;
  name: string;
  plan_id: string;
  day_of_week: number;
}

export default function PlanDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { plan } = route.params;

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    if (plan) {
      fetchExerciseGroups();
      // Set screen title
      navigation.setOptions({
        title: plan.name,
        headerShown: true,
      });
    }
  }, [plan]);

  const fetchExerciseGroups = async () => {
    setLoading(true);
    try {
      const data = await fetchExerciseGroupsByPlan(plan.id);

      if (data && Array.isArray(data)) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching exercise groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async () => {
    if (currentDay === null || !newGroupName.trim()) return;

    try {
      // const response = await fetch('/exercise-groups', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: newGroupName.trim(),
      //     plan_id: plan.id,
      //     day_of_week: currentDay,
      //   }),
      // });

      const newGroup = await createExerciseGroup(plan.id, currentDay, newGroupName);
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setDialogVisible(false);
    } catch (error) {
      console.error('Error creating exercise group:', error);
    }
  };

  const showAddGroupDialog = (dayIndex: number) => {
    setCurrentDay(dayIndex);
    setDialogVisible(true);
  };

  const getGroupsForDay = (dayIndex: number) => {
    return groups.filter(group => group.day_of_week === dayIndex);
  };

  const navigateToExerciseGroup = (group: ExerciseGroup) => {
    // This would navigate to a new screen to manage exercises in this group
    // For now, we'll just log it
    console.log('Navigate to exercise group:', group);
    // Later you can implement:
    // navigation.navigate('ExerciseGroupDetail', { group });
  };

  if (loading && groups.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {weekdays.map((day, index) => {
          const dayGroups = getGroupsForDay(index);
          const isExpanded = expandedDay === index;

          return (
            <View key={index} style={styles.dayContainer}>
              <List.Accordion
                title={day}
                description={`${dayGroups.length} exercise group${dayGroups.length !== 1 ? 's' : ''}`}
                expanded={isExpanded}
                onPress={() => setExpandedDay(isExpanded ? null : index)}
                style={styles.accordion}
              >
                {dayGroups.length === 0 ? (
                  <List.Item
                    title="No exercise groups"
                    description="Add your first exercise group"
                    left={props => <List.Icon {...props} icon="information" />}
                  />
                ) : (
                  dayGroups.map((group) => (
                    <List.Item
                      key={group.id}
                      title={group.name}
                      onPress={() => navigateToExerciseGroup(group)}
                      left={props => <List.Icon {...props} icon="dumbbell" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                  ))
                )}
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => showAddGroupDialog(index)}
                  style={styles.addButton}
                >
                  Add Exercise Group
                </Button>
              </List.Accordion>

              {index < weekdays.length - 1 && <Divider />}
            </View>
          );
        })}
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add Exercise Group</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSubtitle}>
              {currentDay !== null ? `Day: ${weekdays[currentDay]}` : ''}
            </Text>
            <TextInput
              label="Group Name"
              value={newGroupName}
              onChangeText={setNewGroupName}
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAddGroup}
              disabled={!newGroupName.trim()}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    marginBottom: 2,
  },
  accordion: {
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    margin: 16,
  },
  dialogSubtitle: {
    marginBottom: 16,
    fontSize: 16,
  },
  input: {
    marginBottom: 8,
  },
});
