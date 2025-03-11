import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { fetchUserActivities } from '../lib/api';

interface Activity {
  id: string;
  name: string;
}

interface AppContextProps {
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  activities: Activity[];
  refreshActivities: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextProps>({
  selectedActivity: null,
  setSelectedActivity: () => { },
  activities: [],
  refreshActivities: async () => { },
  isLoading: false,
});

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Save selected activity to AsyncStorage
  useEffect(() => {
    if (selectedActivity) {
      AsyncStorage.setItem('selected-activity', JSON.stringify(selectedActivity));
    }
  }, [selectedActivity]);

  // Load saved activity on app start
  useEffect(() => {
    const loadSelectedActivity = async () => {
      try {
        const activityJson = await AsyncStorage.getItem('selected-activity');
        if (activityJson) {
          setSelectedActivity(JSON.parse(activityJson));
        }
      } catch (error) {
        console.error('Error loading saved activity:', error);
      }
    };

    loadSelectedActivity();
    refreshActivities();
  }, []);

  // Fetch user activities from API
  const refreshActivities = async () => {
    setIsLoading(true);
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;

      if (userId) {
        const data = await fetchUserActivities(userId);
        console.log(data)
        if (data && Array.isArray(data)) {
          setActivities(data);

          // If no activity is selected yet but we have activities, select the first one
          if (!selectedActivity && data.length > 0) {
            setSelectedActivity(data[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedActivity,
        setSelectedActivity,
        activities,
        refreshActivities,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
