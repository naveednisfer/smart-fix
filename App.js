import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import BookingScreen from './screens/BookingScreen';
import MyBookingsScreen from './screens/MyBookingsScreen';
import { supabase } from './supabase';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading SmartFix...</Text>
    </View>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={session ? "Home" : "Welcome"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        {session ? (
          // Authenticated stack
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ 
                title: 'SmartFix',
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="Booking" 
              component={BookingScreen}
              options={({ route }) => ({ 
                title: `Book ${route.params?.service || 'Service'}`,
                headerBackTitle: 'Back'
              })}
            />
            <Stack.Screen 
              name="MyBookings" 
              component={MyBookingsScreen} 
              options={{ 
                title: 'My Bookings',
                headerBackTitle: 'Back'
              }} 
            />
          </>
        ) : (
          // Auth stack
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
