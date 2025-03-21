import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PlansScreen from './screens/PlansScreen';
import PlanDetailScreen from './screens/PlanDetailScreen';
import ExercisesScreen from './screens/ExercisesScreen';
import LogsScreen from './screens/LogsScreen';

// Components
import CustomDrawerContent from './components/CustomDrawerContent';

// API and Context
import { supabase } from './lib/supabase';
import { AppContextProvider } from './context/AppContext';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Drawer navigation after authentication
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Plans" component={PlansScreen} />
      <Drawer.Screen name="Exercises" component={ExercisesScreen} />
      <Drawer.Screen name="Logs" component={LogsScreen} />
    </Drawer.Navigator>
  );
}

// Stack for main app flow including plan details
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
    </Stack.Navigator>
  );
}


export default function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    checkUser();

    // Set up auth subscription
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await AsyncStorage.setItem('user-session', JSON.stringify(session));
          setAuthenticated(true);
        }
        if (event === 'SIGNED_OUT') {
          await AsyncStorage.removeItem('user-session');
          setAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  async function checkUser() {
    try {
      const sessionData = await AsyncStorage.getItem('user-session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session) {
          setAuthenticated(true);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setLoading(false);
    }
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AppContextProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            {authenticated ? <MainStack /> : <LoginScreen setAuthenticated={setAuthenticated} />}
          </NavigationContainer>
        </AppContextProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
