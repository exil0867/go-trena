import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import {
  Text,
  List,
  Button,
  Dialog,
  Portal,
  TextInput,
  ActivityIndicator,
  Card,
  Menu as Dropdown
} from 'react-native-paper';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  createExerciseGroup,
  fetchExerciseGroupsByPlan,
  fetchExercisesByGroup,
  fetchAllExercises,
  addExerciseToGroup
} from '../lib/api';

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

interface Exercise {
  id: string;
  name: string;
  description: string;
  category_id: string;
  exercise_group_id?: string;
  category_name?: string;
  exercises?: {
    id: string;
    name: string;
    description: string;
  };
}

export default function PlanDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { plan } = route.params;

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise[]>>({});
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Group dialog state
  const [groupDialogVisible, setGroupDialogVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  // Exercise dialog state
  const [exerciseDialogVisible, setExerciseDialogVisible] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [exerciseMenuVisible, setExerciseMenuVisible] = useState(false);

  const weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (plan) {
        fetchExerciseGroups();
        fetchAvailableExercises();
      }
      return () => { };
    }, [plan])
  );

  useEffect(() => {
    if (plan) {
      // Set screen title
      navigation.setOptions({
        title: plan.name,
        headerShown: true,
      });
    }
  }, [plan, navigation]);

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

  const fetchAvailableExercises = async () => {
    try {
      const data = await fetchAllExercises();
      if (data && Array.isArray(data)) {
        setAllExercises(data);
      }
    } catch (error) {
      console.error('Error fetching all exercises:', error);
    }
  };

  const fetchExercisesForGroup = async (groupId: string) => {
    try {
      const data = await fetchExercisesByGroup(groupId);
      if (data && Array.isArray(data)) {
        setExercises(prev => ({
          ...prev,
          [groupId]: data
        }));
      }
    } catch (error) {
      console.error('Error fetching exercises for group:', error);
    }
  };

  const handleAddGroup = async () => {
    if (currentDay === null || !newGroupName.trim()) return;

    setLoading(true);
    try {
      const newGroup = await createExerciseGroup(plan.id, currentDay, newGroupName);
      // Update groups state and reset form
      setGroups(prevGroups => {
        const updatedGroups = [...prevGroups];
        const exists = updatedGroups.some(g => g.id === newGroup.id);
        if (!exists) {
          updatedGroups.push(newGroup);
        }
        return updatedGroups;
      });

      setNewGroupName('');
      setGroupDialogVisible(false);
    } catch (error) {
      console.error('Error creating exercise group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExerciseToGroup = async () => {
    if (!currentGroupId || !selectedExerciseId) return;

    setLoading(true);
    try {
      const result = await addExerciseToGroup(currentGroupId, selectedExerciseId);

      // Update exercises state
      setExercises(prev => {
        const currentExercises = prev[currentGroupId] || [];
        const updatedExercises = [...currentExercises];
        const exists = updatedExercises.some(e =>
          (e.id === result.id) ||
          (e.exercises && e.exercises.id === result.exercises?.id)
        );

        if (!exists) {
          updatedExercises.push(result);
        }

        return {
          ...prev,
          [currentGroupId]: updatedExercises,
        };
      });

      resetExerciseForm();
    } catch (error) {
      console.error('Error adding exercise to group:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAddGroupDialog = (dayIndex: number) => {
    setCurrentDay(dayIndex);
    setGroupDialogVisible(true);
  };

  const showAddExerciseDialog = (groupId: string) => {
    setCurrentGroupId(groupId);
    setExerciseDialogVisible(true);
  };

  const resetExerciseForm = () => {
    setSelectedExerciseId(null);
    setExerciseDialogVisible(false);
  };

  const getGroupsForDay = (dayIndex: number) => {
    return groups.filter(group => group.day_of_week === dayIndex);
  };

  const toggleGroupExpansion = (groupId: string) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
      // Fetch exercises for this group if not already loaded
      if (!exercises[groupId]) {
        fetchExercisesForGroup(groupId);
      }
    }
  };

  const getExerciseName = (exerciseId: string | null) => {
    if (!exerciseId) return 'Select Exercise';
    const exercise = allExercises.find(ex => ex.id === exerciseId);
    return exercise ? exercise.name : 'Select Exercise';
  };

  const navigateToExerciseDetail = (exercise: Exercise) => {
    console.log('Navigate to exercise detail:', exercise);
    // navigation.navigate('ExerciseDetail', { exercise });
  };

  // Render an exercise item
  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <List.Item
      key={item.id || (item.exercises && item.exercises.id)}
      title={item.exercises ? item.exercises.name : item.name}
      description={item.exercises ? item.exercises.description : item.description}
      onPress={() => navigateToExerciseDetail(item)}
      left={props => <List.Icon {...props} icon="weight-lifter" />}
    />
  );

  // Render an exercise dropdown item
  const renderExerciseOption = (exercise: Exercise) => (
    <Dropdown.Item
      key={exercise.id}
      title={exercise.name}
      onPress={() => {
        setSelectedExerciseId(exercise.id);
        setExerciseMenuVisible(false);
      }}
    />
  );

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
        {weekdays.map((day, dayIndex) => {
          const dayGroups = getGroupsForDay(dayIndex);

          return (
            <View key={dayIndex} style={styles.dayContainer}>
              <Card style={styles.dayCard}>
                <Card.Title
                  title={day}
                  subtitle={`${dayGroups.length} exercise group${dayGroups.length !== 1 ? 's' : ''}`}
                />
                <Card.Content>
                  {dayGroups.length === 0 ? (
                    <Text style={styles.emptyText}>No exercise groups</Text>
                  ) : (
                    dayGroups.map((group) => (
                      <View key={group.id} style={styles.groupContainer}>
                        <List.Accordion
                          title={group.name}
                          expanded={expandedGroup === group.id}
                          onPress={() => toggleGroupExpansion(group.id)}
                          left={props => <List.Icon {...props} icon="dumbbell" />}
                          style={styles.groupAccordion}
                        >
                          <View style={styles.exerciseListContainer}>
                            {exercises[group.id] ? (
                              exercises[group.id].length > 0 ? (
                                <FlatList
                                  data={exercises[group.id]}
                                  renderItem={renderExerciseItem}
                                  keyExtractor={(item) => item.id || (item.exercises && item.exercises.id) || Math.random().toString()}
                                  scrollEnabled={true}
                                  nestedScrollEnabled={true}
                                  style={styles.exerciseList}
                                />
                              ) : (
                                <List.Item
                                  title="No exercises in this group"
                                  description="Add exercises to this group"
                                  left={props => <List.Icon {...props} icon="information" />}
                                />
                              )
                            ) : (
                              <List.Item
                                title="Loading exercises..."
                                left={props => <ActivityIndicator {...props} />}
                              />
                            )}
                          </View>
                          <Button
                            mode="outlined"
                            icon="plus"
                            onPress={() => showAddExerciseDialog(group.id)}
                            style={styles.addExerciseButton}
                          >
                            Add Exercise
                          </Button>
                        </List.Accordion>
                      </View>
                    ))
                  )}
                  <Button
                    mode="outlined"
                    icon="plus"
                    onPress={() => showAddGroupDialog(dayIndex)}
                    style={styles.addButton}
                  >
                    Add Exercise Group
                  </Button>
                </Card.Content>
              </Card>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Group Dialog */}
      <Portal>
        <Dialog visible={groupDialogVisible} onDismiss={() => setGroupDialogVisible(false)}>
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
            <Button onPress={() => setGroupDialogVisible(false)}>Cancel</Button>
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

      {/* Add Exercise Dialog */}
      <Portal>
        <Dialog visible={exerciseDialogVisible} onDismiss={resetExerciseForm}>
          <Dialog.Title>Add Exercise to Group</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSubtitle}>
              Select an exercise to add to this group
            </Text>

            <Text style={styles.dropdownLabel}>Exercise:</Text>
            <View style={styles.dropdownContainer}>
              <Dropdown
                visible={exerciseMenuVisible}
                onDismiss={() => setExerciseMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setExerciseMenuVisible(true)}
                    style={styles.dropdownButton}
                  >
                    {getExerciseName(selectedExerciseId)}
                  </Button>
                }
              >
                <View style={{ maxHeight: 300 }}>
                  <FlatList
                    data={allExercises}
                    renderItem={({ item }) => renderExerciseOption(item)}
                    keyExtractor={(item) => item.id}
                    nestedScrollEnabled={true}
                    style={{ maxHeight: 300 }}
                  />
                </View>
              </Dropdown>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={resetExerciseForm}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAddExerciseToGroup}
              disabled={!selectedExerciseId}
            >
              Add Exercise
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
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayCard: {
    elevation: 2,
  },
  groupContainer: {
    marginBottom: 8,
  },
  groupAccordion: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  exerciseListContainer: {
    maxHeight: 200,
  },
  exerciseList: {
    maxHeight: 200,
  },
  addButton: {
    marginTop: 16,
  },
  addExerciseButton: {
    margin: 16,
  },
  dialogSubtitle: {
    marginBottom: 16,
    fontSize: 16,
  },
  input: {
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownButton: {
    width: '100%',
    justifyContent: 'flex-start',
  },
});
