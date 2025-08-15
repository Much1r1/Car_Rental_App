import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Package, DollarSign, TrendingUp, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { sparePartsService } from '@/services/sparePartsService';
import { Order } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ManagerScreen() {
  const { profile } = useAuth();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    brand: '',
    description: '',
    part_number: '',
    image_url: '',
  });

  useEffect(() => {
    if (profile?.role !== 'shop_manager' && profile?.role !== 'admin') {
      return;
    }
    loadManagerData();
  }, [profile]);

  const loadManagerData = async () => {
    try {
      const [partsData, ordersData] = await Promise.all([
        sparePartsService.getSpareParts(),
        sparePartsService.getAllOrders(),
      ]);
      setSpareParts(partsData);
      setOrders(ordersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleSavePart = async () => {
    try {
      if (!formData.name || !formData.category || !formData.price) {
        Alert.alert('Error', 'Please fill in required fields');
        return;
      }

      const partData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
      };

      if (editingPart) {
        await sparePartsService.updateSparePart(editingPart.id, partData);
      } else {
        await sparePartsService.createSparePart(partData);
      }

      setShowAddModal(false);
      setEditingPart(null);
      resetForm();
      loadManagerData();
      Alert.alert('Success', `Spare part ${editingPart ? 'updated' : 'created'} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save spare part');
    }
  };

  const handleDeletePart = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this spare part?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await sparePartsService.deleteSparePart(id);
              loadManagerData();
              Alert.alert('Success', 'Spare part deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete spare part');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (part: SparePart) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      category: part.category,
      price: part.price.toString(),
      stock: part.stock.toString(),
      brand: part.brand || '',
      description: part.description || '',
      part_number: part.part_number || '',
      image_url: part.image_url || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      brand: '',
      description: '',
      part_number: '',
      image_url: '',
    });
  };

  const renderSparePartItem = ({ item }: { item: SparePart }) => (
    <View style={styles.partCard}>
      <View style={styles.partHeader}>
        <Text style={styles.partName}>{item.name}</Text>
        <View style={styles.partActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Edit size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePart(item.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.partDetails}>
        {item.brand} • {item.category} • Stock: {item.stock}
      </Text>
      <Text style={styles.partPrice}>${item.price}</Text>
    </View>
  );

  if (profile?.role !== 'shop_manager' && profile?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>Access Denied</Text>
          <Text style={styles.unauthorizedSubtext}>Shop Manager access required</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop Manager</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setEditingPart(null);
            setShowAddModal(true);
          }}
        >
          <Plus size={20} color="white" />
          <Text style={styles.addButtonText}>Add Part</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Package size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{spareParts.length}</Text>
          <Text style={styles.statLabel}>Total Parts</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#10B981" />
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
      </View>

      <FlatList
        data={spareParts}
        renderItem={renderSparePartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.partsList}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPart ? 'Edit Part' : 'Add Spare Part'}
            </Text>
            <TouchableOpacity onPress={handleSavePart}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Part name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., Engine, Brakes, Electrical"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>Stock</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(text) => setFormData({ ...formData, stock: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Brand name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Part Number</Text>
              <TextInput
                style={styles.input}
                value={formData.part_number}
                onChangeText={(text) => setFormData({ ...formData, part_number: text })}
                placeholder="Part number"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={formData.image_url}
                onChangeText={(text) => setFormData({ ...formData, image_url: text })}
                placeholder="https://example.com/image.jpg"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Part description"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  partsList: {
    padding: 16,
  },
  partCard: {
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
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  partActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#EBF4FF',
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  partDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  partPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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