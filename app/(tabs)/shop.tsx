import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, ShoppingCart, Package, Star } from 'lucide-react-native';
import { sparePartsService } from '@/services/sparePartsService';
import { SparePart } from '@/lib/supabase';

export default function ShopScreen() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSpareParts();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      const [partsData, categoriesData] = await Promise.all([
        sparePartsService.getSpareParts(),
        sparePartsService.getCategories(),
      ]);
      setSpareParts(partsData);
      setCategories(categoriesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load spare parts');
    } finally {
      setLoading(false);
    }
  };

  const loadSpareParts = async () => {
    try {
      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (searchQuery) filters.search = searchQuery;

      const data = await sparePartsService.getSpareParts(filters);
      setSpareParts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter spare parts');
    }
  };

  const addToCart = (item: SparePart) => {
    setCartCount(prev => prev + 1);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
  };

  const renderCategoryChip = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item ? '' : item)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item && styles.categoryChipTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderPartCard = ({ item }: { item: SparePart }) => (
    <TouchableOpacity style={styles.partCard}>
      <Image source={{ uri: item.image_url }} style={styles.partImage} />
      <View style={styles.partInfo}>
        <Text style={styles.partName}>{item.name}</Text>
        <Text style={styles.partBrand}>{item.brand}</Text>
        <Text style={styles.partCategory}>{item.category}</Text>
        <View style={styles.partFooter}>
          <Text style={styles.partPrice}>${item.price}</Text>
          <Text style={styles.stockText}>Stock: {item.stock}</Text>
        </View>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
        >
          <ShoppingCart size={16} color="white" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Auto Parts Shop</Text>
          <TouchableOpacity style={styles.cartIcon}>
            <ShoppingCart size={24} color="#3B82F6" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search spare parts..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={spareParts}
        renderItem={renderPartCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.partsList}
        columnWrapperStyle={styles.partsRow}
        showsVerticalScrollIndicator={false}
      />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cartIcon: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  partsList: {
    padding: 16,
  },
  partsRow: {
    justifyContent: 'space-between',
  },
  partCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '48%',
  },
  partImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  partInfo: {
    padding: 12,
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  partBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  partCategory: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 8,
  },
  partFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
  },
  addToCartButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});