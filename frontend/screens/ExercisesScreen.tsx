import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Searchbar,
  FAB,
  Dialog,
  Portal,
  TextInput,
  Button,
  Menu as Dropdown,
  ActivityIndicator
} from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { createExercise, fetchAllExercises } from '../lib/api';

interface Exercise {
  id: string;
  name: string;
  description: string;
}


export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');

  const { selectedActivity } = useAppContext();

  useEffect(() => {
    if (selectedActivity) {
      fetchExercises();
    }
  }, [selectedActivity]);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await fetchAllExercises();;

      if (data && Array.isArray(data)) {
        setExercises(data);
        setFilteredExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) return;

    try {
      const newExercise = await createExercise(newExerciseName, newExerciseDescription);

      setExercises([...exercises, newExercise]);
      resetForm();
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };

  const resetForm = () => {
    setNewExerciseName('');
    setNewExerciseDescription('');
    setDialogVisible(false);
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.exerciseName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
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
      ) : loading && exercises.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search exercises"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />

          </View>

          {filteredExercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises found</Text>
              <Text style={styles.emptySubtext}>
                {exercises.length === 0
                  ? 'Create your first exercise by clicking the + button'
                  : 'Try adjusting your search or filters'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredExercises}
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
              <Dialog.Title>Create New Exercise</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  label="Exercise Name"
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Description (optional)"
                  value={newExerciseDescription}
                  onChangeText={setNewExerciseDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />

              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={resetForm}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={handleCreateExercise}
                  disabled={!newExerciseName.trim()}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  filterContainer: {
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  selectedChip: {
    backgroundColor: '#4A90E2',
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
    marginBottom: 8,
  },
  description: {
    color: '#666',
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
    marginBottom: 16,
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
