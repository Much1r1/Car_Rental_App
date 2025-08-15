import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Car, Calendar, DollarSign, MapPin, Settings } from 'lucide-react-native';
import { carsService } from '@/services/carsService';
import { Booking } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminScreen() {
  const { profile } = useAuth();
  const [cars, setCars] = useState<CarType[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    activeBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    loadAdminData();
  }, [profile]);

  const loadAdminData = async () => {
    try {
      const [carsData, bookingsData] = await Promise.all([
        carsService.getCars(),
        carsService.getAllBookings(),
      ]);

      setCars(carsData);
      setBookings(bookingsData);

      // Calculate stats
      const totalCars = carsData.length;
      const availableCars = carsData.filter(car => car.status === 'available').length;
      const activeBookings = bookingsData.filter((b: any) => b.status === 'active').length;
      const totalRevenue = bookingsData
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + b.total_price, 0);

      setStats({
        totalCars,
        availableCars,
        activeBookings,
        totalRevenue,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load admin data');
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'cancel') => {
    try {
      const status = action === 'confirm' ? 'confirmed' : 'cancelled';
      await carsService.updateBookingStatus(bookingId, status);
      loadAdminData(); // Refresh data
      Alert.alert('Success', `Booking ${action}ed successfully`);
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} booking`);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle}>
          {item.car.brand} {item.car.model}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getBookingStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>Customer: {item.user.name}</Text>
      <Text style={styles.bookingDates}>
        {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
      </Text>
      <Text style={styles.bookingPrice}>${item.total_price}</Text>
      
      {item.status === 'pending' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleBookingAction(item.id, 'confirm')}
          >
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleBookingAction(item.id, 'cancel')}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'active': return '#3B82F6';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>Access Denied</Text>
          <Text style={styles.unauthorizedSubtext}>Admin access required</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity style={styles.addCarButton}>
            <Plus size={20} color="white" />
            <Text style={styles.addCarText}>Add Car</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Cars"
            value={stats.totalCars}
            icon={<Car size={24} color="#3B82F6" />}
            color="#3B82F6"
          />
          <StatCard
            title="Available"
            value={stats.availableCars}
            icon={<Car size={24} color="#10B981" />}
            color="#10B981"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={<Calendar size={24} color="#F59E0B" />}
            color="#F59E0B"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={<DollarSign size={24} color="#8B5CF6" />}
            color="#8B5CF6"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <FlatList
            data={bookings.slice(0, 10)}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addCarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addCarText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  customerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
});