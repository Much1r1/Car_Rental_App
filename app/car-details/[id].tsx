import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  Fuel, 
  Settings,
  ChevronRight 
} from 'lucide-react-native';
import { carsService } from '@/services/carsService';
import { Car } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function CarDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (id) {
      loadCarDetails();
    }
  }, [id]);

  const loadCarDetails = async () => {
    try {
      const carData = await carsService.getCarById(id!);
      setCar(carData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load car details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      Alert.alert('Select Dates', 'Please select your rental dates first');
      return;
    }
    
    router.push({
      pathname: '/booking/confirm',
      params: {
        carId: id,
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate,
      },
    });
  };

  const calculateDays = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) return 0;
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalPrice = car ? calculateDays() * car.price_per_day : 0;

  if (loading || !car) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: car.image_url }} style={styles.carImage} />
        
        <View style={styles.content}>
          <View style={styles.carHeader}>
            <View style={styles.carTitleSection}>
              <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
              <Text style={styles.carYear}>{car.year}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(car.status) }]}>
              <Text style={styles.statusText}>{car.status}</Text>
            </View>
          </View>

          <View style={styles.ratingSection}>
            <View style={styles.rating}>
              <Star size={20} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>4.8 (124 reviews)</Text>
            </View>
            <View style={styles.location}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.locationText}>{car.location}</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price per day</Text>
            <Text style={styles.price}>${car.price_per_day}</Text>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresGrid}>
              {car.features?.map((feature, index) => (
                <View key={index} style={styles.featureChip}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {car.description || 'No description available'}
            </Text>
          </View>

          <View style={styles.bookingSection}>
            <Text style={styles.sectionTitle}>Select Rental Dates</Text>
            
            <TouchableOpacity style={styles.dateSelector}>
              <Calendar size={20} color="#3B82F6" />
              <View style={styles.dateContent}>
                <Text style={styles.dateLabel}>Pick-up Date</Text>
                <Text style={styles.dateValue}>
                  {selectedDates.startDate || 'Select date'}
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateSelector}>
              <Calendar size={20} color="#3B82F6" />
              <View style={styles.dateContent}>
                <Text style={styles.dateLabel}>Return Date</Text>
                <Text style={styles.dateValue}>
                  {selectedDates.endDate || 'Select date'}
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            {calculateDays() > 0 && (
              <View style={styles.priceBreakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    ${car.price_per_day} × {calculateDays()} days
                  </Text>
                  <Text style={styles.breakdownValue}>${totalPrice}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${totalPrice}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bookButton, car.status !== 'available' && styles.bookButtonDisabled]}
          onPress={handleBookNow}
          disabled={car.status !== 'available'}
        >
          <Text style={styles.bookButtonText}>
            {car.status === 'available' ? 'Book Now' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#10B981';
    case 'booked': return '#F59E0B';
    case 'maintenance': return '#EF4444';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  carImage: {
    width: width,
    height: 250,
  },
  content: {
    padding: 20,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carTitleSection: {
    flex: 1,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  carYear: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    color: '#1F2937',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 4,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  bookingSection: {
    marginBottom: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dateContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 2,
  },
  priceBreakdown: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});