import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  Divider,
  FAB,
  Dialog,
  Portal,
  Button,
  TextInput,
  Menu as Dropdown,
  ActivityIndicator
} from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { ExerciseLogsResponse, ExerciseLogWithExercise, fetchExercises, fetchLogs, logExercise } from '../lib/api';

interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  created_at: string;
}

interface Exercise {
  id: string;
  name: string;
}

export default function LogsScreen() {
  const [logs, setLogs] = useState<ExerciseLogsResponse>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [exerciseMenuVisible, setExerciseMenuVisible] = useState(false);

  // Form state
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const { selectedActivity } = useAppContext();

  useEffect(() => {
    if (selectedActivity) {
      handleFetchLogs();
      handleFetchExercises();
    }
  }, [selectedActivity]);

  const handleFetchLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExercises = async () => {
    setExercisesLoading(true);
    try {
      const data = await fetchExercises();

      if (data && Array.isArray(data)) {
        setExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleLogExercise = async () => {
    if (!selectedExerciseId || !sets || !reps) return;

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (userId) {
        const newLog = await logExercise(selectedExerciseId, sets, reps, weight, notes);

        // Add exercise name to the new log
        const exercise = exercises.find(ex => ex.id === selectedExerciseId);
        newLog.exercise_name = exercise ? exercise.name : 'Unknown';

        setLogs([newLog, ...logs]);
        resetForm();
      }
    } catch (error) {
      console.error('Error logging exercise:', error);
    }
  };

  const resetForm = () => {
    setSelectedExerciseId(null);
    setSets('');
    setReps('');
    setWeight('');
    setNotes('');
    setDialogVisible(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMetrics = (item: ExerciseLogWithExercise) => {
    const { exercise, metrics } = item;

    switch (exercise.tracking_type) {
      case 'reps_sets_weight':
        return (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.sets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.reps}</Text>
              <Text style={styles.statLabel}>Reps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {metrics.weight ? `${metrics.weight} kg` : '-'}
              </Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
          </>
        );
      default:
        return (
          <View>
            <Text style={styles.statValue}>Unknown Metrics</Text>
          </View>
        );
    }
  };

  const getExerciseName = (exerciseId: string | null) => {
    if (!exerciseId) return 'Select Exercise';
    const exercise = exercises.find(ex => ex.id === exerciseId);
    return exercise ? exercise.name : 'Select Exercise';
  };

  const renderItem = ({ item }: { item: ExerciseLogWithExercise }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.exerciseName}>{item.exercise.name}</Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        <Divider style={styles.divider} />
        <View style={styles.statsContainer}>
          {renderMetrics(item)}
        </View>
        {item.metrics.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notes}>{item.metrics.notes}</Text>
          </View>
        ) : null}
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
      ) : loading && logs.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <>
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercise logs yet</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your progress by logging your exercises
              </Text>
            </View>
          ) : (
            <FlatList
              data={logs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}

          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setDialogVisible(true)}
          />

          <Portal>
            <Dialog visible={dialogVisible} onDismiss={resetForm}>
              <Dialog.Title>Log Exercise</Dialog.Title>
              <Dialog.Content>
                {exercisesLoading ? (
                  <ActivityIndicator size="small" style={styles.dialogLoading} />
                ) : (
                  <>
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
                        {exercises.map((exercise) => (
                          <Dropdown.Item
                            key={exercise.id}
                            onPress={() => {
                              setSelectedExerciseId(exercise.id);
                              setExerciseMenuVisible(false);
                            }}
                            title={exercise.name}
                          />
                        ))}
                      </Dropdown>
                    </View>

                    <View style={styles.formRow}>
                      <TextInput
                        label="Sets"
                        value={sets}
                        onChangeText={setSets}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.input, styles.smallInput]}
                      />

                      <TextInput
                        label="Reps"
                        value={reps}
                        onChangeText={setReps}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.input, styles.smallInput]}
                      />

                      <TextInput
                        label="Weight (kg)"
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.input, styles.smallInput]}
                      />
                    </View>

                    <TextInput
                      label="Notes (optional)"
                      value={notes}
                      onChangeText={setNotes}
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      style={styles.input}
                    />
                  </>
                )}
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={resetForm}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={handleLogExercise}
                  disabled={!selectedExerciseId || !sets || !reps || exercisesLoading}
                >
                  Log
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
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
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
  dialogLoading: {
    marginVertical: 20,
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 16,
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 4,
  },
});
