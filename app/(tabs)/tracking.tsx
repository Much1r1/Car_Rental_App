import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Car, Clock, Navigation } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface GPSLocation {
  id: string;
  car_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  last_updated: string;
  car?: {
    brand: string;
    model: string;
    license_plate: string;
  };
}

export default function TrackingScreen() {
  const { profile } = useAuth();
  const [locations, setLocations] = useState<GPSLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGPSData();
    
    // Set up real-time subscription for GPS updates
    const subscription = supabase
      .channel('gps_tracking')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gps_tracking'
      }, (payload) => {
        console.log('GPS update received:', payload);
        loadGPSData(); // Refresh data on changes
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadGPSData = async () => {
    try {
      let query = supabase
        .from('gps_tracking')
        .select(`
          *,
          car:cars(brand, model, license_plate)
        `)
        .order('last_updated', { ascending: false });

      // If user is not admin, only show their active bookings
      if (profile?.role !== 'admin') {
        // Get user's active bookings and filter GPS data
        const { data: userBookings } = await supabase
          .from('bookings')
          .select('car_id')
          .eq('user_id', profile?.id)
          .eq('status', 'active');

        if (userBookings && userBookings.length > 0) {
          const carIds = userBookings.map(b => b.car_id);
          query = query.in('car_id', carIds);
        } else {
          // No active bookings, show empty array
          setLocations([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setLocations(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load GPS data');
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderLocationItem = ({ item }: { item: GPSLocation }) => (
    <View style={styles.locationCard}>
      <View style={styles.carHeader}>
        <View style={styles.carInfo}>
          <Text style={styles.carTitle}>
            {item.car?.brand} {item.car?.model}
          </Text>
          <Text style={styles.licensePlate}>{item.car?.license_plate}</Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineIndicator} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      <View style={styles.locationDetails}>
        <View style={styles.locationRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.coordinatesText}>
            {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Navigation size={16} color="#6B7280" />
          <Text style={styles.speedText}>{item.speed.toFixed(1)} km/h</Text>
        </View>
        <View style={styles.locationRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.lastUpdatedText}>
            {formatLastUpdated(item.last_updated)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewMapButton}>
        <MapPin size={16} color="#3B82F6" />
        <Text style={styles.viewMapText}>View on Map</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GPS Tracking</Text>
        <Text style={styles.headerSubtitle}>
          {profile?.role === 'admin' ? 'All Vehicles' : 'Your Rentals'}
        </Text>
      </View>

      {locations.length === 0 ? (
        <View style={styles.emptyState}>
          <Car size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No vehicles to track</Text>
          <Text style={styles.emptySubtitle}>
            {profile?.role === 'admin' 
              ? 'No vehicles are currently being tracked'
              : 'You have no active rentals with GPS tracking'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.locationsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  locationsList: {
    padding: 16,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carInfo: {
    flex: 1,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  licensePlate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  locationDetails: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'monospace',
  },
  speedText: {
    fontSize: 14,
    color: '#4B5563',
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#4B5563',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewMapText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});