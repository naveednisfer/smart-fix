import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BookingScreen({ route, navigation }) {
  const { service } = route.params;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!date.trim()) {
      Alert.alert('Error', 'Please enter a date');
      return false;
    }
    if (!time.trim()) {
      Alert.alert('Error', 'Please enter a time');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return false;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format (e.g., 2024-12-25)');
      return false;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert('Error', 'Please enter time in HH:MM format (e.g., 14:30)');
      return false;
    }

    // Check if date is in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      Alert.alert('Error', 'Please select a future date');
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not logged in');
        setLoading(false);
        return;
      }

      // Save to Supabase
      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id: user.id,
          service,
          date,
          time,
          address,
          comments,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]).select();

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Save to AsyncStorage
        const localKey = `bookings_${user.id}`;
        const existing = await AsyncStorage.getItem(localKey);
        let bookings = existing ? JSON.parse(existing) : [];
        // Use Supabase id if available, otherwise Date.now()
        const newBooking = {
          id: (data && data[0] && data[0].id) || Date.now(),
          service,
          date,
          time,
          address,
          comments,
          status: 'upcoming',
        };
        bookings.push(newBooking);
        await AsyncStorage.setItem(localKey, JSON.stringify(bookings));
        Alert.alert(
          'Success', 
          'Booking submitted successfully! You will receive a confirmation shortly.',
          [
            { 
              text: 'View My Bookings', 
              onPress: () => navigation.navigate('MyBookings') 
            },
            { 
              text: 'Book Another Service', 
              onPress: () => navigation.navigate('Home') 
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Book {service}</Text>
          <Text style={styles.subtitle}>Please provide the details for your booking</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
              value={date}
              onChangeText={setDate}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.helperButton}
              onPress={() => setDate(getCurrentDate())}
            >
              <Text style={styles.helperText}>Use Today's Date</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM (e.g. 14:30)"
              value={time}
              onChangeText={setTime}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.helperButton}
              onPress={() => setTime(getCurrentTime())}
            >
              <Text style={styles.helperText}>Use Current Time</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your full address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comments (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any specific details or requests for the service provider"
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleBooking} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Submitting Booking...' : 'Submit Booking'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  helperButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  helperText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 