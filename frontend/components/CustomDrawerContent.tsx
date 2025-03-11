import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem
} from '@react-navigation/drawer';
import { Text, Divider, ActivityIndicator, Menu as Dropdown } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function CustomDrawerContent(props: any) {
  const {
    activities,
    selectedActivity,
    setSelectedActivity,
    refreshActivities,
    isLoading
  } = useAppContext();

  const [menuVisible, setMenuVisible] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.headerContainer}>
        <Text style={styles.appName}>Go-Trena</Text>
        <Text style={styles.tagline}>Training Management App</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Activity</Text>

        {isLoading ? (
          <ActivityIndicator size="small" style={styles.loading} />
        ) : (
          <View style={styles.dropdownContainer}>
            <Dropdown
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Text
                  style={styles.dropdownButton}
                  onPress={() => setMenuVisible(true)}
                >
                  {selectedActivity?.name || 'Select Activity'}
                </Text>
              }
            >
              {activities.map((activity) => (
                <Dropdown.Item
                  key={activity.id}
                  onPress={() => {
                    setSelectedActivity(activity);
                    setMenuVisible(false);
                  }}
                  title={activity.name}
                />
              ))}
            </Dropdown>
          </View>
        )}
      </View>

      <Divider style={styles.divider} />

      <DrawerItemList {...props} />

      <Divider style={styles.divider} />

      <DrawerItem
        label="Sign Out"
        onPress={handleSignOut}
        style={styles.signOutButton}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    paddingTop: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  tagline: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  activityContainer: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
  },
  loading: {
    marginTop: 8,
  },
  dropdownContainer: {
    marginTop: 4,
  },
  dropdownButton: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 8,
  },
});
