import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.replace('Login');
        return;
      }
      setUserId(user.id);
      // Load from AsyncStorage
      const localKey = `bookings_${user.id}`;
      const local = await AsyncStorage.getItem(localKey);
      let localBookings = local ? JSON.parse(local) : [];
      // Remove past bookings
      const today = new Date().toISOString().split('T')[0];
      localBookings = localBookings.filter(b => b.date >= today);
      await AsyncStorage.setItem(localKey, JSON.stringify(localBookings));
      setBookings(localBookings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleComplete = async (id) => {
    if (!userId) return;
    const localKey = `bookings_${userId}`;
    let local = await AsyncStorage.getItem(localKey);
    let localBookings = local ? JSON.parse(local) : [];
    localBookings = localBookings.filter(b => b.id !== id);
    await AsyncStorage.setItem(localKey, JSON.stringify(localBookings));
    setBookings(localBookings);
    // Optionally, also delete from Supabase:
     await supabase.from('bookings').delete().eq('id', id);
  };

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.date >= today);
  };

  const getPastBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.date < today);
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <Text style={styles.serviceName}>{item.service}</Text>
      <Text style={styles.bookingDetails}>Date: {item.date}</Text>
      <Text style={styles.bookingDetails}>Time: {item.time}</Text>
      <Text style={styles.bookingDetails}>Address: {item.address}</Text>
      {item.comments ? (
        <Text style={styles.bookingComments}>Comment: {item.comments}</Text>
      ) : null}
      <Text style={[styles.status, { color: item.date >= new Date().toISOString().split('T')[0] ? '#28a745' : '#6c757d' }]}>
        {item.date >= new Date().toISOString().split('T')[0] ? 'Upcoming' : 'Completed'}
      </Text>
      {item.date >= new Date().toISOString().split('T')[0] && (
        <TouchableOpacity style={styles.completeButton} onPress={() => handleComplete(item.id)}>
          <Text style={styles.completeButtonText}>Completed</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSection = (title, data) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title} ({data.length})</Text>
      {data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingItem}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>No {title.toLowerCase()} bookings</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  return (
    <View style={styles.container}>
      <FlatList
        data={[
          { type: 'upcoming', data: upcomingBookings },
          { type: 'past', data: pastBookings }
        ]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => 
          renderSection(
            item.type === 'upcoming' ? 'Upcoming Bookings' : 'Past Bookings',
            item.data
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ...StyleSheet.flatten({
    completeButton: {
      marginTop: 12,
      backgroundColor: '#007AFF',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    completeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    bookingComments: {
      fontSize: 14,
      color: '#007AFF',
      marginBottom: 4,
      fontStyle: 'italic',
    },
  }),
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginVertical: 12,
    color: '#333',
  },
  bookingItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bookingDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
}); 